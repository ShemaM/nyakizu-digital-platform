"""
products/serializers.py
"""

from rest_framework import serializers
from .models import Category, Product
from accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ("id", "name", "slug", "description")
        read_only_fields = ("id",)


class ProductSerializer(serializers.ModelSerializer):
    """
    Full product view — used for a seller viewing their own products.
    Includes stock_quantity.
    """
    category_name   = serializers.CharField(source="category.name", read_only=True)
    seller_username = serializers.CharField(source="seller.username", read_only=True)
    availability_label = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = (
            "id", "seller", "seller_username",
            "category", "category_name",
            "name", "description", "price",
            "stock_quantity",          # visible to owner only
            "availability_label",
            "status", "image_url",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "seller", "created_at", "updated_at")

    def get_availability_label(self, obj):
        if obj.stock_quantity > 0:
            return "available"
        return "can_be_sourced"


class BuyerProductSerializer(serializers.ModelSerializer):
    """
    Buyer-facing product view — stock_quantity is intentionally omitted.
    Buyers only see the availability label derived from stock.
    """
    category_name      = serializers.CharField(source="category.name", read_only=True)
    seller_username    = serializers.CharField(source="seller.username", read_only=True)
    availability_label = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = (
            "id", "seller", "seller_username",
            "category", "category_name",
            "name", "description", "price",
            "availability_label",      # stock_quantity deliberately excluded
            "status", "image_url",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "seller", "created_at", "updated_at")

    def get_availability_label(self, obj):
        if obj.stock_quantity > 0:
            return "available"
        return "can_be_sourced"


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = ("category", "name", "description", "price", "stock_quantity", "status", "image_url")

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value
