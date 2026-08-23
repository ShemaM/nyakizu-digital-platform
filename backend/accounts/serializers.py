import re

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import transaction, IntegrityError
from .models import CustomUser, BuyerProfile, SellerProfile, BuyerStoreFollow, BuyerSellerRelationship

PHONE_RE = re.compile(r"^\+?[0-9 ()-]{7,20}$")


class RegisterSerializer(serializers.Serializer):
    """
    Single-call registration for both roles.

    Buyer:  { full_name, username, email, phone, password, role, location, main_supplier, business_type }
    Seller: { full_name, username, email, phone, password, role, shop_name, shop_location, categories[] }
    """

    full_name = serializers.CharField(max_length=200)
    username  = serializers.CharField(max_length=150, validators=[UnicodeUsernameValidator()])
    email     = serializers.EmailField()
    phone     = serializers.CharField(max_length=20)
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
        existing = CustomUser.objects.filter(email__iexact=value).first()
        if existing:
            # A slow/timed-out request can leave a real account behind even
            # though the user saw a "failed" response — point them at the
            # actual next step instead of a dead-end duplicate error.
            if not existing.is_email_verified:
                raise serializers.ValidationError(
                    "An account with this email already exists but isn't verified yet. "
                    "Check your inbox for the verification link, or use 'Resend verification email'."
                )
            raise serializers.ValidationError(
                "An account with this email already exists. Please sign in instead."
            )
        return value.lower()

    def validate_phone(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Enter your phone number.")
        if not PHONE_RE.match(value):
            raise serializers.ValidationError("Enter a valid phone number.")
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

        try:
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
        except IntegrityError:
            # validate_email/username/phone above already checked for
            # duplicates, but that check and this insert aren't atomic with
            # each other — two concurrent registrations for the same email
            # can both pass validation and race to this insert. Without this,
            # the loser gets a raw 500 instead of a normal validation error.
            raise serializers.ValidationError(
                {"email": "An account with these details already exists. Please sign in instead."}
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
                "mpesa_till_number": profile.mpesa_till_number,
                "mpesa_pochi_number": profile.mpesa_pochi_number,
                "mpesa_paybill_number": profile.mpesa_paybill_number,
                "mpesa_paybill_account": profile.mpesa_paybill_account,
                "mpesa_send_money_number": profile.mpesa_send_money_number,
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


class ProfileUpdateSerializer(serializers.Serializer):
    """
    Partial update for the signed-in user's own profile — name, email,
    phone, and/or avatar. Every field is optional (PATCH semantics): the
    view only touches fields actually present in `validated_data`, so a
    buyer fixing just their phone number doesn't have to resend an avatar.
    """

    MAX_AVATAR_BYTES = 5 * 1024 * 1024  # 5MB

    full_name    = serializers.CharField(max_length=200, required=False, allow_blank=False)
    email        = serializers.EmailField(required=False)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=False)
    avatar       = serializers.ImageField(required=False)

    def validate_avatar(self, value):
        if value.size > self.MAX_AVATAR_BYTES:
            raise serializers.ValidationError("Image must be smaller than 5MB.")
        return value

    def validate_email(self, value):
        value = value.lower()
        user = self.context["request"].user
        if CustomUser.objects.exclude(pk=user.pk).filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_phone_number(self, value):
        value = value.strip()
        if not PHONE_RE.match(value):
            raise serializers.ValidationError("Enter a valid phone number.")
        user = self.context["request"].user
        if CustomUser.objects.exclude(pk=user.pk).filter(phone_number=value).exists():
            raise serializers.ValidationError("An account with this phone number already exists.")
        return value


class BuyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model        = BuyerProfile
        fields       = ("id", "user", "location", "main_supplier", "business_type", "created_at")
        read_only_fields = ("id", "created_at")


class SellerProfileSerializer(serializers.ModelSerializer):
    """Full seller profile, including the owner's personal email/phone via
    the nested UserSerializer. Only for the store owner themselves or an
    admin reviewing an application — never for anonymous/public requests.
    See PublicSellerProfileSerializer for the buyer-facing version."""
    user = UserSerializer(read_only=True)

    class Meta:
        model  = SellerProfile
        fields = (
            "id", "user", "store_name", "store_description",
            "location", "categories", "approval_status", "is_live", "created_at",
            "mpesa_till_number", "mpesa_pochi_number",
            "mpesa_paybill_number", "mpesa_paybill_account", "mpesa_send_money_number",
        )
        read_only_fields = ("id", "approval_status", "is_live", "created_at")


class PublicSellerUserSerializer(serializers.ModelSerializer):
    """The subset of a seller's account safe to show to any site visitor —
    no email or phone number (those are personal contact details, not the
    M-Pesa payment numbers on SellerProfile, which are meant to be public)."""
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model  = CustomUser
        fields = ("id", "username", "full_name", "avatar_url", "date_joined")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url


class PublicSellerProfileSerializer(SellerProfileSerializer):
    """Store page as shown to buyers/anonymous visitors. Same fields as
    SellerProfileSerializer, but with the seller's personal email/phone
    stripped out of the nested user object."""
    user = PublicSellerUserSerializer(read_only=True)


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
