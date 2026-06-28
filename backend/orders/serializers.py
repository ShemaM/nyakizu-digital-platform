"""
orders/serializers.py

Serializers for orders and order items.
"""

from django.db import transaction
from rest_framework import serializers
from accounts.models import BuyerSellerRelationship
from accounts.permissions import is_verified_buyer
from .models import Order, OrderItem
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    """Represents a single line inside an order."""

    # Show the product name alongside the ID for readability
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal')
        read_only_fields = ('id', 'unit_price')   # price is set automatically

    def get_subtotal(self, obj):
        return obj.subtotal()


class OrderItemCreateSerializer(serializers.Serializer):
    """Used when a buyer submits an order — just needs product ID + quantity."""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    """Full order representation including all line items."""

    items = OrderItemSerializer(many=True, read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'buyer', 'buyer_username', 'status',
            'total_price', 'delivery_address', 'buyer_notes',
            'items', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'buyer', 'total_price', 'created_at', 'updated_at')


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

            if not BuyerSellerRelationship.objects.filter(
                buyer=user,
                seller=store,
                status="approved",
            ).exists():
                raise serializers.ValidationError(
                    f"You must be approved by {store.store_name} before ordering."
                )

            if product.stock_quantity < quantity:
                raise serializers.ValidationError(
                    f"Not enough stock for '{product.name}'. "
                    f"Available: {product.stock_quantity}, requested: {quantity}."
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

                # Re-check stock inside the transaction so concurrent orders cannot oversell.
                if product.stock_quantity < item_data['quantity']:
                    raise serializers.ValidationError(
                        f"Not enough stock for '{product.name}'. "
                        f"Available: {product.stock_quantity}, requested: {item_data['quantity']}."
                    )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item_data['quantity'],
                    unit_price=product.price,
                )

                product.stock_quantity -= item_data['quantity']
                if product.stock_quantity == 0:
                    product.status = 'out_of_stock'
                product.save(update_fields=['stock_quantity', 'status', 'updated_at'])

            order.calculate_total()
        return order
