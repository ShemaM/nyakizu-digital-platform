"""
accounts/serializers.py

Serializers convert our Python model instances to JSON (and back).
Think of them like forms — they validate input and shape output.
"""

import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, BuyerProfile, SellerProfile


# ---------------------------------------------------------------------------
# Registration — matches the 3-step onboarding wizard in the frontend exactly
# ---------------------------------------------------------------------------

class RegisterSerializer(serializers.Serializer):
    """
    Accepts all three steps of the frontend registration wizard in one payload.

    Frontend sends:
      Buyer:  { full_name, phone, password, role, location, main_supplier, business_type }
      Seller: { full_name, phone, password, role, shop_name, shop_location, categories[] }

    We create the CustomUser plus a BuyerProfile or SellerProfile in one call.
    """

    # --- Step 2: Account fields (AccountForm in frontend) ---
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, validators=[validate_password])

    # --- Step 1: Role (RoleChoice in frontend) ---
    role = serializers.ChoiceField(choices=['buyer', 'seller'])

    # --- Step 3 Seller: SellerDetailsForm fields ---
    shop_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    shop_location = serializers.CharField(max_length=150, required=False, allow_blank=True)
    categories = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
    )

    # --- Step 3 Buyer: BuyerDetailsForm fields ---
    location = serializers.CharField(max_length=150, required=False, allow_blank=True)
    main_supplier = serializers.CharField(max_length=200, required=False, allow_blank=True)
    business_type = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate(self, data):
        """
        Check that role-specific required fields are present.
        This mirrors the client-side validation in the frontend forms.
        """
        role = data.get('role')

        if role == 'seller':
            if not data.get('shop_name', '').strip():
                raise serializers.ValidationError({'shop_name': 'Enter your shop name.'})
            if not data.get('shop_location', '').strip():
                raise serializers.ValidationError({'shop_location': 'Enter your shop location.'})
            if not data.get('categories'):
                raise serializers.ValidationError({'categories': 'Choose at least one category.'})

        elif role == 'buyer':
            if not data.get('location', '').strip():
                raise serializers.ValidationError({'location': 'Enter where you sell from.'})
            if not data.get('business_type', '').strip():
                raise serializers.ValidationError({'business_type': 'Choose how you trade.'})

        return data

    def _make_username(self, full_name):
        """
        Generate a unique username from the full name.

        "Claudine Mutesi" → "claudine_mutesi"
        If already taken, appends a counter: "claudine_mutesi_2".
        """
        # lowercase and replace spaces/special chars with underscores
        base = re.sub(r'[^\w]', '_', full_name.strip().lower())
        base = re.sub(r'_+', '_', base).strip('_')  # collapse multiple underscores
        if not base:
            base = 'user'

        username = base
        counter = 2
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base}_{counter}"
            counter += 1
        return username

    def create(self, validated_data):
        """Create CustomUser + BuyerProfile or SellerProfile in one go."""
        role = validated_data['role']
        full_name = validated_data['full_name'].strip()

        # Split "Claudine Mutesi" → first_name="Claudine", last_name="Mutesi"
        parts = full_name.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        username = self._make_username(full_name)

        user = CustomUser.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            phone_number=validated_data['phone'],
            password=validated_data['password'],
            role=role,
        )

        if role == 'seller':
            SellerProfile.objects.create(
                user=user,
                store_name=validated_data['shop_name'],
                location=validated_data.get('shop_location', ''),
                categories=validated_data.get('categories', []),
            )
        else:
            BuyerProfile.objects.create(
                user=user,
                location=validated_data.get('location', ''),
                main_supplier=validated_data.get('main_supplier', ''),
                business_type=validated_data.get('business_type', ''),
            )

        return user


# ---------------------------------------------------------------------------
# Read serializers — safe to return in API responses
# ---------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    """Public representation of a user (never expose the password hash)."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'full_name', 'role', 'phone_number', 'date_joined')
        read_only_fields = ('id', 'date_joined')

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class BuyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = BuyerProfile
        fields = ('id', 'user', 'location', 'main_supplier', 'business_type', 'created_at')
        read_only_fields = ('id', 'created_at')


class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SellerProfile
        fields = (
            'id', 'user', 'store_name', 'store_description',
            'location', 'categories', 'is_verified', 'created_at',
        )
        read_only_fields = ('id', 'is_verified', 'created_at')
