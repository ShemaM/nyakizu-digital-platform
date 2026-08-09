"""
products/serializers.py
"""

from rest_framework import serializers
from .image_fetch import fetch_image_from_url, ImageFetchError, MAX_IMAGE_BYTES
from .models import AttributeValue, Category, CategoryAttribute, Product


class AttributeValueSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AttributeValue
        fields = ("id", "value")


class CategoryAttributeSerializer(serializers.ModelSerializer):
    values = AttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model  = CategoryAttribute
        fields = ("id", "name", "values")


class CategorySerializer(serializers.ModelSerializer):
    # Read-only variant taxonomy for this category (e.g. Screen Protectors ->
    # Phone Model / Material / Function) — lets the product form fetch a
    # category's own attributes once the seller picks it.
    attributes = CategoryAttributeSerializer(many=True, read_only=True)

    class Meta:
        model  = Category
        fields = ("id", "name", "slug", "description", "attributes")
        read_only_fields = ("id", "slug")


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    """A product's selected variant value, with its attribute name for display (e.g. "Material: Tempered Glass")."""

    attribute_name = serializers.CharField(source="attribute.name", read_only=True)

    class Meta:
        model  = AttributeValue
        fields = ("id", "attribute_name", "value")


class ProductSerializer(serializers.ModelSerializer):
    """
    Full product view — used for a seller viewing their own products.
    Includes stock_quantity.
    """
    category_name   = serializers.CharField(source="category.name", read_only=True)
    seller_username = serializers.CharField(source="seller.username", read_only=True)
    availability_label = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    attribute_values = ProductAttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model  = Product
        fields = (
            "id", "seller", "seller_username",
            "category", "category_name",
            "name", "description", "price",
            "stock_quantity",          # visible to owner only
            "availability_label",
            "status", "image_url", "attribute_values",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "seller", "created_at", "updated_at")

    def get_availability_label(self, obj):
        if obj.stock_quantity > 0:
            return "available"
        return "can_be_sourced"

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url


class BuyerProductSerializer(serializers.ModelSerializer):
    """
    Buyer-facing product view — stock_quantity is intentionally omitted.
    Buyers only see the availability label derived from stock.
    """
    category_name      = serializers.CharField(source="category.name", read_only=True)
    seller_username    = serializers.CharField(source="seller.username", read_only=True)
    availability_label = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    attribute_values = ProductAttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model  = Product
        fields = (
            "id", "seller", "seller_username",
            "category", "category_name",
            "name", "description", "price",
            "availability_label",      # stock_quantity deliberately excluded
            "status", "image_url", "attribute_values",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "seller", "created_at", "updated_at")

    def get_availability_label(self, obj):
        if obj.stock_quantity > 0:
            return "available"
        return "can_be_sourced"

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url


class ProductCreateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    # Alternative to uploading a file — the seller pastes an image link and
    # the server fetches it (client-side fetch of an arbitrary URL would
    # fail on any host without permissive CORS, which is most of them).
    image_source_url = serializers.URLField(required=False, allow_blank=True, write_only=True)
    attribute_value_ids = serializers.PrimaryKeyRelatedField(
        source="attribute_values", queryset=AttributeValue.objects.all(),
        many=True, required=False,
    )

    class Meta:
        model  = Product
        fields = (
            "category", "name", "description", "price", "stock_quantity", "status",
            "image", "image_source_url", "attribute_value_ids",
        )

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_image(self, value):
        if value and value.size > MAX_IMAGE_BYTES:
            raise serializers.ValidationError("Image must be smaller than 8MB.")
        return value

    def validate(self, data):
        image_source_url = data.pop("image_source_url", None)
        if image_source_url and not data.get("image"):
            try:
                data["image"] = fetch_image_from_url(image_source_url)
            except ImageFetchError as exc:
                raise serializers.ValidationError({"image_source_url": str(exc)})
        return data
