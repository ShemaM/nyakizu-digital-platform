"""
products/serializers.py

Serializers for categories and products.
"""

from rest_framework import serializers
from .models import Category, Product
from accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description')
        read_only_fields = ('id',)


class ProductSerializer(serializers.ModelSerializer):
    """Full product representation — used when returning product details."""

    # Show category name instead of just the ID
    category_name = serializers.CharField(source='category.name', read_only=True)

    # Show seller username instead of just the ID
    seller_username = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'seller', 'seller_username',
            'category', 'category_name',
            'name', 'description', 'price',
            'stock_quantity', 'status', 'image_url',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'seller', 'created_at', 'updated_at')


class ProductCreateSerializer(serializers.ModelSerializer):
    """Used when a seller creates or updates a product."""

    class Meta:
        model = Product
        fields = ('category', 'name', 'description', 'price', 'stock_quantity', 'status', 'image_url')

    def validate_price(self, value):
        """Price must be greater than zero."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value
