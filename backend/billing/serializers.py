from django.conf import settings
from rest_framework import serializers

from .models import CreditEntry
from .payments import normalize_phone


class CreditEntrySerializer(serializers.ModelSerializer):
    """One line of a seller's statement. Amounts are strings ("-20.00"), like the rest of this API."""

    order_id = serializers.IntegerField(source="order_fee.order_id", read_only=True, default=None)

    class Meta:
        model = CreditEntry
        fields = ("id", "kind", "amount_kes", "balance_after_kes", "order_id", "note", "created_at")


class TopUpSerializer(serializers.Serializer):
    """Body of POST /api/billing/pay/. The phone comes back in +254 form."""

    amount_kes = serializers.DecimalField(max_digits=10, decimal_places=2)
    phone = serializers.CharField(max_length=20)

    def validate_amount_kes(self, value):
        low, high = settings.BILLING_MIN_TOPUP_KES, settings.BILLING_MAX_TOPUP_KES
        if value != value.to_integral_value():
            raise serializers.ValidationError("Enter a whole number of shillings.")
        if not low <= value <= high:
            raise serializers.ValidationError(f"You can top up between KES {low:,} and KES {high:,}.")
        return value

    def validate_phone(self, value):
        phone = normalize_phone(value)
        if phone is None:
            raise serializers.ValidationError("Enter a Safaricom number, like 0712 345 678.")
        return phone
