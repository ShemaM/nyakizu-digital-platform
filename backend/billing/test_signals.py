from decimal import Decimal
from unittest import mock

from django.test import TestCase, override_settings

from billing.models import OrderFee
from billing.services import charge_order_fee, ensure_account, get_active_schedule
from billing.testing import make_order, make_seller, set_account
from orders.models import OrderStatusEvent


def lock(seller, total="4000.00"):
    """Record a 'locked' status event for a fresh order — what OrderDetailView does when a seller locks a price."""
    order = make_order(seller, total=total)
    OrderStatusEvent.objects.create(order=order, status="locked")
    return order


class ChargingSwitchTests(TestCase):
    def setUp(self):
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)

    @override_settings(BILLING_CHARGING_ENABLED=False)
    def test_while_charging_is_off_locking_charges_nothing_and_uses_no_free_orders(self):
        for _ in range(6):
            lock(self.seller)

        self.assertFalse(OrderFee.objects.exists())
        self.account.refresh_from_db()
        self.assertEqual((self.account.free_orders_used, self.account.credit_kes, self.account.debt_since), (0, 0, None))

    @override_settings(BILLING_CHARGING_ENABLED=True)
    def test_while_charging_is_on_locking_uses_free_orders_then_charges(self):
        for _ in range(4):
            lock(self.seller)

        self.assertEqual(OrderFee.objects.filter(status="waived_free").count(), 3)
        self.assertEqual(OrderFee.objects.filter(status="charged").count(), 1)
        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("-20.00"))

    def test_orders_locked_before_go_live_are_never_charged_afterwards_and_free_orders_count_from_go_live(self):
        before = []
        with override_settings(BILLING_CHARGING_ENABLED=False):
            before = [lock(self.seller) for _ in range(5)]

        with override_settings(BILLING_CHARGING_ENABLED=True):
            after = [lock(self.seller) for _ in range(4)]

        self.assertFalse(OrderFee.objects.filter(order__in=before).exists())
        self.assertEqual(
            list(OrderFee.objects.filter(order__in=after).order_by("order_id").values_list("status", flat=True)),
            ["waived_free", "waived_free", "waived_free", "charged"],
        )

    @override_settings(BILLING_CHARGING_ENABLED=False)
    def test_a_fee_charged_earlier_is_still_refunded_after_charging_is_switched_off(self):
        set_account(self.account, free_orders_used=get_active_schedule().free_orders_allowance)
        order = make_order(self.seller, total="4000.00")
        charge_order_fee(order)
        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("-20.00"))

        OrderStatusEvent.objects.create(order=order, status="cancelled")

        self.assertEqual(OrderFee.objects.get(order=order).status, "refunded")
        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("0.00"))

    @override_settings(BILLING_CHARGING_ENABLED=True)
    def test_a_billing_failure_never_breaks_locking_the_order(self):
        order = make_order(self.seller)
        with mock.patch("billing.signals.charge_order_fee", side_effect=RuntimeError("boom")):
            with self.assertLogs("billing", level="ERROR"):
                event = OrderStatusEvent.objects.create(order=order, status="locked")
        self.assertIsNotNone(event.pk)
