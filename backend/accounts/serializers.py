"""
accounts/serializers.py

Serializers convert our Python model instances to JSON (and back).
Think of them like forms — they validate input and shape output.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, SellerProfile


class RegisterSerializer(serializers.ModelSerializer):
    """Used when a new user signs up."""

    # write_only=True means the password appears in input but NOT in the API response
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2', 'role', 'phone_number')

    def validate(self, data):
        """Check that both passwords match."""
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        """Create the user with a hashed password (never store plain text!)."""
        validated_data.pop('password2')   # remove the confirmation field
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)       # Django hashes the password here
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Read-only representation of a user (safe to return in API responses)."""

    class Meta:
        model = CustomUser
        # Never expose the password hash in responses
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class SellerProfileSerializer(serializers.ModelSerializer):
    """Serializer for the seller store profile."""

    # Nest the user info so we get it in one API call
    user = UserSerializer(read_only=True)

    class Meta:
        model = SellerProfile
        fields = ('id', 'user', 'store_name', 'store_description', 'location', 'is_verified', 'created_at')
        read_only_fields = ('id', 'is_verified', 'created_at')
