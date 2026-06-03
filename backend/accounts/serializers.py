import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, BuyerProfile, SellerProfile, BuyerSellerRelationship


class RegisterSerializer(serializers.Serializer):
    """
    Single-call registration for both roles.

    Buyer:  { full_name, email, phone, password, role, location, main_supplier, business_type }
    Seller: { full_name, email, phone, password, role, shop_name, shop_location, categories[] }
    """

    full_name = serializers.CharField(max_length=200)
    email     = serializers.EmailField()
    phone     = serializers.CharField(max_length=20)
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    role      = serializers.ChoiceField(choices=['buyer', 'seller'])

    # Seller-specific
    shop_name     = serializers.CharField(max_length=150, required=False, allow_blank=True)
    shop_location = serializers.CharField(max_length=150, required=False, allow_blank=True)
    categories    = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True)

    # Buyer-specific
    location      = serializers.CharField(max_length=150, required=False, allow_blank=True)
    main_supplier = serializers.CharField(max_length=200, required=False, allow_blank=True)
    business_type = serializers.CharField(max_length=20,  required=False, allow_blank=True)

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_phone(self, value):
        if CustomUser.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("An account with this phone number already exists.")
        return value

    def validate(self, data):
        role = data.get("role")
        if role == "seller":
            if not data.get("shop_name", "").strip():
                raise serializers.ValidationError({"shop_name": "Enter your shop name."})
            if not data.get("shop_location", "").strip():
                raise serializers.ValidationError({"shop_location": "Enter your shop location."})
            if not data.get("categories"):
                raise serializers.ValidationError({"categories": "Choose at least one category."})
        elif role == "buyer":
            if not data.get("location", "").strip():
                raise serializers.ValidationError({"location": "Enter where you trade from."})
            if not data.get("business_type", "").strip():
                raise serializers.ValidationError({"business_type": "Choose how you trade."})
        return data

    def _make_username(self, full_name: str) -> str:
        base = re.sub(r"[^\w]", "_", full_name.strip().lower())
        base = re.sub(r"_+", "_", base).strip("_") or "user"
        username = base
        counter  = 2
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base}_{counter}"
            counter += 1
        return username

    def create(self, validated_data):
        role      = validated_data["role"]
        full_name = validated_data["full_name"].strip()
        parts     = full_name.split(" ", 1)

        user = CustomUser.objects.create_user(
            username=self._make_username(full_name),
            email=validated_data["email"],
            first_name=parts[0],
            last_name=parts[1] if len(parts) > 1 else "",
            phone_number=validated_data["phone"],
            password=validated_data["password"],
            role=role,
            is_email_verified=False,
        )

        if role == "seller":
            SellerProfile.objects.create(
                user=user,
                store_name=validated_data["shop_name"],
                location=validated_data.get("shop_location", ""),
                categories=validated_data.get("categories", []),
            )
        else:
            BuyerProfile.objects.create(
                user=user,
                location=validated_data.get("location", ""),
                main_supplier=validated_data.get("main_supplier", ""),
                business_type=validated_data.get("business_type", ""),
            )

        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = CustomUser
        fields = (
            "id", "username", "full_name", "email", "role",
            "phone_number", "is_email_verified", "date_joined",
        )
        read_only_fields = ("id", "date_joined", "is_email_verified")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class BuyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model        = BuyerProfile
        fields       = ("id", "user", "location", "main_supplier", "business_type", "created_at")
        read_only_fields = ("id", "created_at")


class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model  = SellerProfile
        fields = (
            "id", "user", "store_name", "store_description",
            "location", "categories", "approval_status", "is_live", "created_at",
        )
        read_only_fields = ("id", "approval_status", "is_live", "created_at")


class BuyerSellerRelationshipSerializer(serializers.ModelSerializer):
    buyer_name  = serializers.SerializerMethodField()
    store_name  = serializers.SerializerMethodField()

    class Meta:
        model  = BuyerSellerRelationship
        fields = ("id", "buyer_name", "store_name", "status", "requested_at")

    def get_buyer_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.username

    def get_store_name(self, obj):
        return obj.seller.store_name
