"""
orders/serializers.py

Serializers for orders and order items.
"""

from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from accounts.permissions import is_verified_buyer
from accounts.models import SellerProfile, BuyerSellerRelationship
from .models import Order, OrderItem, OrderStatusEvent, PaymentClaim, PaymentRecord
from .notifications import record_status_event
from products.models import Product

# A double-click or a network retry resubmitting the same "place order" POST
# is the realistic failure mode here — not two legitimate orders to the same
# seller a second apart. A short cooldown catches the former without getting
# in the way of the latter (just wait a moment and resubmit).
DUPLICATE_ORDER_WINDOW = timedelta(seconds=20)


class OrderItemSerializer(serializers.ModelSerializer):
    """Represents a single line inside an order."""

    # Falls back to custom_name for a sourcing line with no catalog product
    product_name = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'custom_name', 'quantity', 'unit_price', 'subtotal', 'is_sourcing', 'is_packed', 'not_found')
        read_only_fields = ('id', 'unit_price', 'is_sourcing', 'is_packed', 'not_found')   # is_packed/not_found flip via their dedicated toggle endpoints

    def get_product_name(self, obj):
        return obj.product.name if obj.product else obj.custom_name

    def get_subtotal(self, obj):
        return obj.subtotal()


class OrderItemCreateSerializer(serializers.Serializer):
    """
    Used when a buyer submits an order — either an existing catalog product
    (`product_id`) or a free-text item the seller doesn't currently stock
    (`custom_name`, from the cart's "Can't find it? Ask us to source it"
    box), plus `quantity`. Exactly one of the two per line.
    """
    product_id = serializers.IntegerField(required=False)
    custom_name = serializers.CharField(max_length=200, required=False, allow_blank=False)
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, data):
        has_product = 'product_id' in data
        has_custom = bool(data.get('custom_name', '').strip())
        if has_product == has_custom:  # both present or neither
            raise serializers.ValidationError("Each item needs either a product or a name to source — not both, not neither.")
        return data


class OrderStatusEventSerializer(serializers.ModelSerializer):
    """One row of an order's status history — powers the buyer-facing tracker."""

    class Meta:
        model = OrderStatusEvent
        fields = ('status', 'created_at')
        read_only_fields = fields


class PaymentClaimSerializer(serializers.ModelSerializer):
    """A buyer's self-reported 'I paid — here's the code' — see PaymentClaim for why this doesn't touch amount_paid."""

    class Meta:
        model = PaymentClaim
        fields = ('id', 'amount', 'reference', 'submitted_at', 'resolved')
        read_only_fields = fields


class PaymentRecordSerializer(serializers.ModelSerializer):
    """One confirmed payment from the ledger — the buyer/seller-facing payment history."""

    recorded_by_username = serializers.CharField(source='recorded_by.username', read_only=True, default=None)

    class Meta:
        model = PaymentRecord
        fields = ('id', 'amount', 'reference', 'method', 'recorded_by_username', 'created_at')
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    """Full order representation including all line items."""

    items = OrderItemSerializer(many=True, read_only=True)
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    buyer_full_name = serializers.SerializerMethodField()
    buyer_phone = serializers.CharField(source='buyer.phone_number', read_only=True)
    seller_store_name = serializers.SerializerMethodField()
    seller_payment_info = serializers.SerializerMethodField()
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_payment_late = serializers.BooleanField(read_only=True)
    status_history = OrderStatusEventSerializer(source='status_events', many=True, read_only=True)
    payment_claims = PaymentClaimSerializer(many=True, read_only=True)
    payment_history = PaymentRecordSerializer(source='payment_records', many=True, read_only=True)

    def get_buyer_full_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.username

    def get_seller_store_name(self, obj):
        if not obj.seller:
            return None
        try:
            return obj.seller.seller_profile.store_name
        except Exception:
            return obj.seller.get_full_name() or obj.seller.username

    def get_seller_payment_info(self, obj):
        """Where the buyer should send M-Pesa money — only the methods this seller actually filled in."""
        if not obj.seller:
            return None
        try:
            profile = obj.seller.seller_profile
        except Exception:
            return None
        info = {
            "till_number": profile.mpesa_till_number,
            "pochi_number": profile.mpesa_pochi_number,
            "paybill_number": profile.mpesa_paybill_number,
            "paybill_account": profile.mpesa_paybill_account,
            "send_money_number": profile.mpesa_send_money_number,
        }
        return info if any(info.values()) else None

    class Meta:
        model = Order
        fields = (
            'id', 'buyer', 'buyer_username', 'buyer_full_name', 'buyer_phone', 'seller', 'seller_store_name', 'status',
            'total_price', 'final_total', 'amount_paid', 'balance',
            'payment_reference', 'payment_method', 'seller_payment_info',
            'expected_payment_date', 'is_payment_late',
            'delivery_address', 'buyer_notes', 'sourcing_notes',
            'is_flagged', 'flag_reason', 'flagged_at',
            'items', 'status_history', 'payment_claims', 'payment_history', 'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'buyer', 'seller', 'total_price', 'created_at', 'updated_at', 'balance', 'is_payment_late',
            'is_flagged', 'flag_reason', 'flagged_at',  # set only via the flag/unflag endpoints
        )


class OrderCreateSerializer(serializers.Serializer):
    """
    Used when a buyer creates a new order.

    The buyer sends `seller_id` — the *SellerProfile* id, the same
    identifier already used everywhere else in this flow (the storefront
    URL, the product list's `?seller=` filter) — plus a list of items: each
    either an existing catalog product (`product_id`) or a free-text
    sourcing request (`custom_name`) the seller doesn't stock yet. We
    create the Order + OrderItems, snapshotting catalog prices where we
    have them.
    """
    items = OrderItemCreateSerializer(many=True)
    seller_id = serializers.IntegerField()
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

        try:
            seller_store = SellerProfile.objects.select_related('user').get(id=data['seller_id'])
        except SellerProfile.DoesNotExist:
            raise serializers.ValidationError({"seller_id": "Seller not found."})
        seller_user = seller_store.user

        if Order.objects.filter(
            buyer=user, seller=seller_user,
            created_at__gte=timezone.now() - DUPLICATE_ORDER_WINDOW,
        ).exists():
            raise serializers.ValidationError(
                "You just placed an order with this seller — give it a moment before submitting another."
            )

        is_approved_buyer = BuyerSellerRelationship.objects.filter(
            buyer=user, seller=seller_store, status="approved"
        ).exists()
        if not is_approved_buyer:
            raise serializers.ValidationError(
                "You must be approved by this seller before placing an order. "
                "Request access from their storefront first."
            )

        # Split into catalog lines (merged by product, quantities summed) and
        # custom sourcing lines (kept one-per-submission — two "phone case"
        # requests in the same order are two separate things to go find).
        totals_by_product = {}
        custom_items = []
        for item_data in items:
            if 'product_id' in item_data:
                product_id = item_data['product_id']
                totals_by_product[product_id] = totals_by_product.get(product_id, 0) + item_data['quantity']
            else:
                custom_items.append({'custom_name': item_data['custom_name'].strip(), 'quantity': item_data['quantity']})

        products_by_id = {}
        if totals_by_product:
            products = Product.objects.select_related("seller").filter(id__in=totals_by_product.keys())
            products_by_id = {product.id: product for product in products}

            missing_ids = set(totals_by_product) - set(products_by_id)
            if missing_ids:
                missing = ", ".join(str(product_id) for product_id in sorted(missing_ids))
                raise serializers.ValidationError(f"Product id(s) not found: {missing}.")

            for product in products_by_id.values():
                if product.seller_id != seller_user.id:
                    raise serializers.ValidationError(f"'{product.name}' does not belong to this seller.")
                if product.status != "available":
                    raise serializers.ValidationError(
                        f"'{product.name}' is not currently available for ordering."
                    )

        data['product_items'] = [
            {'product_id': product_id, 'quantity': quantity}
            for product_id, quantity in totals_by_product.items()
        ]
        data['custom_items'] = custom_items
        data['seller_user'] = seller_user
        return data

    def create(self, validated_data):
        """Create the order and stock snapshots atomically."""
        buyer = self.context['request'].user
        seller_user = validated_data['seller_user']

        with transaction.atomic():
            order = Order.objects.create(
                buyer=buyer,
                seller=seller_user,
                delivery_address=validated_data.get('delivery_address', ''),
                buyer_notes=validated_data.get('buyer_notes', ''),
            )

            for item_data in validated_data['product_items']:
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

            for item_data in validated_data['custom_items']:
                OrderItem.objects.create(
                    order=order,
                    product=None,
                    custom_name=item_data['custom_name'],
                    quantity=item_data['quantity'],
                    unit_price=None,
                    is_sourcing=True,
                )

            order.calculate_total()

        record_status_event(order, order.status)
        return order
