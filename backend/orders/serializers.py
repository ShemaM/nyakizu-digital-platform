"""
orders/serializers.py

Serializers for orders and order items.
"""

from rest_framework import serializers
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

    def validate_items(self, items):
        """Make sure every requested product exists and has enough stock."""
        if not items:
            raise serializers.ValidationError("Order must contain at least one item.")

        for item_data in items:
            try:
                product = Product.objects.get(id=item_data['product_id'])
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    f"Product with id={item_data['product_id']} does not exist."
                )
            if product.stock_quantity < item_data['quantity']:
                raise serializers.ValidationError(
                    f"Not enough stock for '{product.name}'. "
                    f"Available: {product.stock_quantity}, requested: {item_data['quantity']}."
                )
        return items

    def create(self, validated_data):
        """Create the Order and all its OrderItems in one transaction."""
        buyer = self.context['request'].user
        items_data = validated_data.pop('items')

        order = Order.objects.create(
            buyer=buyer,
            delivery_address=validated_data.get('delivery_address', ''),
            buyer_notes=validated_data.get('buyer_notes', ''),
        )

        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                unit_price=product.price,   # snapshot the price right now
            )

            # Reduce the product's stock
            product.stock_quantity -= item_data['quantity']
            if product.stock_quantity == 0:
                product.status = 'out_of_stock'
            product.save()

        # Calculate and save the total
        order.calculate_total()
        return order
