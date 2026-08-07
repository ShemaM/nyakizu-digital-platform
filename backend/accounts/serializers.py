from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import transaction
from .models import CustomUser, BuyerProfile, SellerProfile, BuyerStoreFollow, BuyerSellerRelationship


class RegisterSerializer(serializers.Serializer):
    """
    Single-call registration for both roles.

    Buyer:  { full_name, username, email, phone, password, role, location, main_supplier, business_type }
    Seller: { full_name, username, email, phone, password, role, shop_name, shop_location, categories[] }
    """

    full_name = serializers.CharField(max_length=200)
    username  = serializers.CharField(max_length=150, validators=[UnicodeUsernameValidator()])
    email     = serializers.EmailField()
    phone     = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    role      = serializers.ChoiceField(choices=['buyer', 'seller'])

    # Seller-specific
    shop_name     = serializers.CharField(max_length=150, required=False, allow_blank=True)
    shop_location = serializers.CharField(max_length=150, required=False, allow_blank=True)
    categories    = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    # Buyer-specific
    location      = serializers.CharField(max_length=150, required=False, allow_blank=True)
    main_supplier = serializers.CharField(max_length=200, required=False, allow_blank=True)
    business_type = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_username(self, value):
        value = value.strip()
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

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
        elif role == "buyer":
            pass
        return data

    @transaction.atomic
    def create(self, validated_data):
        role      = validated_data["role"]
        full_name = validated_data["full_name"].strip()
        parts     = full_name.split(" ", 1)

        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=parts[0],
            last_name=parts[1] if len(parts) > 1 else "",
            phone_number=validated_data.get("phone", ""),
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
    avatar_url = serializers.SerializerMethodField()
    seller_profile = serializers.SerializerMethodField()
    buyer_profile = serializers.SerializerMethodField()

    class Meta:
        model  = CustomUser
        fields = (
            "id", "username", "full_name", "email", "role",
            "phone_number", "is_email_verified", "date_joined",
            "avatar_url", "seller_profile", "buyer_profile",
        )
        read_only_fields = ("id", "date_joined", "is_email_verified")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url

    def get_seller_profile(self, obj):
        if obj.role != "seller":
            return None
        try:
            profile = obj.seller_profile
            return {
                "id": profile.id,
                "store_name": profile.store_name,
                "store_description": profile.store_description,
                "location": profile.location,
                "categories": profile.categories,
                "approval_status": profile.approval_status,
                "approval_note": profile.approval_note,
                "is_live": profile.is_live,
            }
        except SellerProfile.DoesNotExist:
            return None

    def get_buyer_profile(self, obj):
        if obj.role != "buyer":
            return None
        try:
            profile = obj.buyer_profile
            return {
                "id": profile.id,
                "location": profile.location,
                "main_supplier": profile.main_supplier,
                "business_type": profile.business_type,
            }
        except BuyerProfile.DoesNotExist:
            return None


class AvatarUploadSerializer(serializers.Serializer):
    MAX_AVATAR_BYTES = 5 * 1024 * 1024  # 5MB

    avatar = serializers.ImageField()

    def validate_avatar(self, value):
        if value.size > self.MAX_AVATAR_BYTES:
            raise serializers.ValidationError("Image must be smaller than 5MB.")
        return value


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




class BuyerStoreFollowSerializer(serializers.ModelSerializer):
    """
    Serializer for buyer following wholesalers.
    """

    store_id = serializers.IntegerField(source="seller.id", read_only=True)
    store_name = serializers.CharField(source="seller.store_name", read_only=True)
    store_location = serializers.CharField(source="seller.location", read_only=True)
    categories = serializers.JSONField(source="seller.categories", read_only=True)
    is_live = serializers.BooleanField(source="seller.is_live", read_only=True)

    class Meta:
        model = BuyerStoreFollow
        fields = (
            "id",
            "store_id",
            "store_name",
            "store_location",
            "categories",
            "is_live",
            "created_at",
        )
        read_only_fields = fields


class BuyerSellerRelationshipSerializer(serializers.ModelSerializer):
    """
    A buyer's trusted-supplier request/approval with a specific seller store.
    Shared by both the buyer view (their requests to sellers) and the seller
    view (buyer requests made to their store) — the frontend does not
    distinguish, it just reads whichever fields are relevant.
    """

    buyer_id = serializers.IntegerField(source="buyer.id", read_only=True)
    buyer_name = serializers.SerializerMethodField()
    buyer_phone = serializers.CharField(source="buyer.phone_number", read_only=True)
    buyer_email = serializers.CharField(source="buyer.email", read_only=True)
    seller_id = serializers.IntegerField(source="seller.id", read_only=True)
    seller_name = serializers.CharField(source="seller.store_name", read_only=True)
    created_at = serializers.DateTimeField(source="requested_at", read_only=True)

    class Meta:
        model = BuyerSellerRelationship
        fields = (
            "id",
            "status",
            "created_at",
            "buyer_id",
            "buyer_name",
            "buyer_phone",
            "buyer_email",
            "seller_id",
            "seller_name",
        )
        read_only_fields = fields

    def get_buyer_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.username


class CommunityStatsSerializer(serializers.Serializer):
    """Aggregate counts shown on the homepage community section."""
    members = serializers.IntegerField()
    stores = serializers.IntegerField()
    products = serializers.IntegerField()
    cities = serializers.IntegerField()


class RecentMemberSerializer(serializers.Serializer):
    """A single recently-joined buyer or seller, for the homepage feed."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    role = serializers.CharField()
    verified = serializers.BooleanField()
    location = serializers.CharField()
    joined = serializers.DateField()
    avatar = serializers.CharField(allow_null=True)


class CommunityActivitySerializer(serializers.Serializer):
    """Full response shape for GET /api/accounts/community/."""
    stats = CommunityStatsSerializer()
    recent_members = RecentMemberSerializer(many=True)
