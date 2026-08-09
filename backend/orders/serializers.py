"""
orders/serializers.py

Serializers for orders and order items.
"""

from django.db import transaction
from rest_framework import serializers
from accounts.permissions import is_verified_buyer
from accounts.models import BuyerSellerRelationship
from .models import Order, OrderItem, OrderStatusEvent
from .notifications import record_status_event
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    """Represents a single line inside an order."""

    # Show the product name alongside the ID for readability
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal', 'is_sourcing')
        read_only_fields = ('id', 'unit_price', 'is_sourcing')   # set automatically at creation

    def get_subtotal(self, obj):
        return obj.subtotal()


class OrderItemCreateSerializer(serializers.Serializer):
    """Used when a buyer submits an order — just needs product ID + quantity."""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderStatusEventSerializer(serializers.ModelSerializer):
    """One row of an order's status history — powers the buyer-facing tracker."""

    class Meta:
        model = OrderStatusEvent
        fields = ('status', 'created_at')
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    """Full order representation including all line items."""

    items = OrderItemSerializer(many=True, read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    status_history = OrderStatusEventSerializer(source='status_events', many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'buyer', 'buyer_username', 'seller', 'status',
            'total_price', 'final_total', 'amount_paid', 'balance',
            'payment_reference', 'payment_method',
            'delivery_address', 'buyer_notes', 'sourcing_notes',
            'is_flagged', 'flag_reason', 'flagged_at',
            'items', 'status_history', 'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'buyer', 'seller', 'total_price', 'created_at', 'updated_at', 'balance',
            'is_flagged', 'flag_reason', 'flagged_at',  # set only via the flag/unflag endpoints
        )


class OrderCreateSerializer(serializers.Serializer):
    """
    Used when a buyer creates a new order.

    The buyer sends a list of {product_id, quantity} pairs plus a delivery address.
    We create the Order + OrderItems and snapshot the current prices.
    """
    items = OrderItemCreateSerializer(many=True)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    buyer_notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        """Validate the order against buyer trust, seller approval, and stock rules."""
        user = self.context['request'].user
        items = data.get('items', [])

        if not is_verified_buyer(user):
            raise serializers.ValidationError(
                "Only verified buyers can place orders."
            )

        if not items:
            raise serializers.ValidationError("Order must contain at least one item.")

        totals_by_product = {}
        for item_data in items:
            product_id = item_data['product_id']
            totals_by_product[product_id] = (
                totals_by_product.get(product_id, 0) + item_data['quantity']
            )

        products = Product.objects.select_related("seller__seller_profile").filter(
            id__in=totals_by_product.keys()
        )
        products_by_id = {product.id: product for product in products}

        missing_ids = set(totals_by_product) - set(products_by_id)
        if missing_ids:
            missing = ", ".join(str(product_id) for product_id in sorted(missing_ids))
            raise serializers.ValidationError(f"Product id(s) not found: {missing}.")

        sellers = {product.seller_id for product in products_by_id.values()}
        if len(sellers) != 1:
            raise serializers.ValidationError(
                "Create one order per seller. Multi-seller orders are not enabled yet."
            )

        first_product = next(iter(products_by_id.values()))
        try:
            seller_store = first_product.seller.seller_profile
        except Exception:
            raise serializers.ValidationError(
                "This product does not belong to an approved seller store."
            )

        is_approved_buyer = BuyerSellerRelationship.objects.filter(
            buyer=user, seller=seller_store, status="approved"
        ).exists()
        if not is_approved_buyer:
            raise serializers.ValidationError(
                "You must be approved by this seller before placing an order. "
                "Request access from their storefront first."
            )

        for product_id, quantity in totals_by_product.items():
            product = products_by_id[product_id]

            if product.status != "available":
                raise serializers.ValidationError(
                    f"'{product.name}' is not currently available for ordering."
                )

            try:
                store = product.seller.seller_profile
            except Exception:
                raise serializers.ValidationError(
                    f"'{product.name}' does not belong to an approved seller store."
                )

            if store.approval_status != "approved":
                raise serializers.ValidationError(
                    f"'{product.name}' belongs to a seller that is not approved."
                )

        data['items'] = [
            {'product_id': product_id, 'quantity': quantity}
            for product_id, quantity in totals_by_product.items()
        ]
        return data

    def create(self, validated_data):
        """Create the order and stock snapshots atomically."""
        buyer = self.context['request'].user
        items_data = validated_data.pop('items')

        with transaction.atomic():
            order = Order.objects.create(
                buyer=buyer,
                delivery_address=validated_data.get('delivery_address', ''),
                buyer_notes=validated_data.get('buyer_notes', ''),
            )

            for item_data in items_data:
                product = Product.objects.select_for_update().get(id=item_data['product_id'])
                quantity = item_data['quantity']
                # Sellers can always outsource a shortfall — zero stock and a
                # partial shortfall (some stock, just not enough) are both
                # sourcing requests, not a hard block. Sell whatever is
                # actually on the shelf and flag the line for the seller to
                # source/price the rest.
                is_sourcing = product.stock_quantity < quantity

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    unit_price=product.price,
                    is_sourcing=is_sourcing,
                )

                if product.stock_quantity > 0:
                    product.stock_quantity = max(product.stock_quantity - quantity, 0)
                    if product.stock_quantity == 0:
                        product.status = 'out_of_stock'
                    product.save(update_fields=['stock_quantity', 'status', 'updated_at'])

            # Set seller from first item's product
            first_item = OrderItem.objects.filter(order=order).first()
            if first_item and first_item.product:
                order.seller = first_item.product.seller
                order.save(update_fields=['seller'])

            order.calculate_total()

        record_status_event(order, order.status)
        return order
