from datetime import timedelta
from unittest import mock

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import BuyerSellerRelationship
from billing.access import FEE_GATED_ACTIONS, has_feature
from billing.models import OrderFee
from billing.services import ensure_account
from billing.testing import approve_buyer, make_buyer, make_order, make_seller, set_account
from decimal import Decimal
from orders.models import Order, OrderStatusEvent


def owe(account, kes, days_ago=0):
    """Put the account into debt of `kes`, aged `days_ago` days."""
    set_account(
        account, credit_kes=Decimal(str(-kes)),
        debt_since=timezone.now() - timedelta(days=days_ago),
    )


class FeeGatedActionsTests(TestCase):
    def test_todays_two_gated_actions(self):
        self.assertEqual(set(FEE_GATED_ACTIONS), {"approve_new_buyers", "lock_order"})
        self.assertEqual(FEE_GATED_ACTIONS["approve_new_buyers"]["level"], 3)
        self.assertEqual(FEE_GATED_ACTIONS["lock_order"]["level"], 4)


@override_settings(BILLING_ENFORCEMENT_ENABLED=True)
class HasFeatureTests(TestCase):
    def setUp(self):
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)

    def test_an_action_that_is_not_gated_is_always_allowed(self):
        owe(self.account, 1000)
        self.assertTrue(has_feature(self.seller, "view_orders"))

    @override_settings(BILLING_ENFORCEMENT_ENABLED=False)
    def test_nothing_is_gated_while_enforcement_is_off(self):
        owe(self.account, 1000)  # would be well past level 4 with enforcement on
        self.assertTrue(has_feature(self.seller, "approve_new_buyers"))
        self.assertTrue(has_feature(self.seller, "lock_order"))

    def test_a_seller_with_plenty_of_credit_can_do_both(self):
        self.assertTrue(has_feature(self.seller, "approve_new_buyers"))
        self.assertTrue(has_feature(self.seller, "lock_order"))

    def test_level_3_blocks_approving_but_not_locking(self):
        owe(self.account, 250)
        self.assertFalse(has_feature(self.seller, "approve_new_buyers"))
        self.assertTrue(has_feature(self.seller, "lock_order"))

    def test_level_4_blocks_both(self):
        owe(self.account, 600)
        self.assertFalse(has_feature(self.seller, "approve_new_buyers"))
        self.assertFalse(has_feature(self.seller, "lock_order"))

    def test_it_accepts_the_user_as_well_as_the_store_profile(self):
        owe(self.account, 600)
        self.assertFalse(has_feature(self.seller.user, "lock_order"))

    def test_if_billing_breaks_the_action_is_allowed_and_the_error_is_logged(self):
        owe(self.account, 600)
        with mock.patch("billing.access.enforcement_level", side_effect=RuntimeError("boom")):
            with self.assertLogs("billing", level="ERROR"):
                self.assertTrue(has_feature(self.seller, "lock_order"))


@override_settings(BILLING_ENFORCEMENT_ENABLED=True)
class ApproveBuyerEndpointTests(TestCase):
    def setUp(self):
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)
        self.client = APIClient()
        self.client.force_authenticate(self.seller.user)
        self.pending = make_buyer("waiting")
        BuyerSellerRelationship.objects.create(buyer=self.pending, seller=self.seller, status="pending")

    def resolve(self, buyer, action):
        relationship = BuyerSellerRelationship.objects.get(buyer=buyer, seller=self.seller)
        return self.client.post(f"/api/accounts/relationships/{relationship.pk}/resolve/", {"action": action}, format="json")

    def test_a_seller_who_owes_enough_gets_a_402_and_the_buyer_stays_pending(self):
        owe(self.account, 600)
        response = self.resolve(self.pending, "approve")
        self.assertEqual(response.status_code, 402)
        self.assertEqual(response.json()["feature"], "approve_new_buyers")
        self.assertEqual(BuyerSellerRelationship.objects.get(buyer=self.pending, seller=self.seller).status, "pending")

    def test_denying_is_never_blocked(self):
        owe(self.account, 600)
        self.assertEqual(self.resolve(self.pending, "deny").status_code, 200)

    def test_re_approving_an_already_approved_buyer_is_never_blocked(self):
        owe(self.account, 600)
        approved = make_buyer("existing")
        approve_buyer(self.seller, approved)
        self.assertEqual(self.resolve(approved, "approve").status_code, 200)

    def test_paying_down_the_balance_unblocks_approval(self):
        owe(self.account, 600)
        self.assertEqual(self.resolve(self.pending, "approve").status_code, 402)
        set_account(self.account, credit_kes=Decimal("50.00"), debt_since=None)
        self.assertEqual(self.resolve(self.pending, "approve").status_code, 200)


@override_settings(BILLING_ENFORCEMENT_ENABLED=True, BILLING_CHARGING_ENABLED=True)
class OrderLockingTests(TestCase):
    """The real signal path: PATCHing an order to 'locked' both charges the fee and can be blocked by it."""

    def setUp(self):
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)
        for _ in range(3):
            OrderStatusEvent.objects.create(order=make_order(self.seller, total="1.00"), status="locked")
        self.buyer = make_buyer("regular")
        approve_buyer(self.seller, self.buyer)
        self.client = APIClient()
        self.client.force_authenticate(self.seller.user)

    def lock(self, order, total="4000.00"):
        return self.client.patch(f"/api/orders/{order.pk}/", {"status": "locked", "final_total": total}, format="json")

    def test_locking_an_order_charges_the_fee_once_the_free_orders_are_used(self):
        order = make_order(self.seller, buyer=self.buyer, status="sourcing")
        response = self.lock(order)
        self.assertEqual(response.status_code, 200)
        fee = OrderFee.objects.get(order=order)
        self.assertEqual((fee.status, fee.amount_kes), ("charged", Decimal("20.00")))
        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("-20.00"))

    def test_a_seller_at_level_4_cannot_lock_a_new_order(self):
        owe(self.account, 600)
        order = make_order(self.seller, buyer=self.buyer, status="sourcing")
        response = self.lock(order)
        self.assertEqual(response.status_code, 402)
        self.assertEqual(response.json()["feature"], "lock_order")
        order.refresh_from_db()
        self.assertEqual(order.status, "sourcing")
        self.assertFalse(OrderFee.objects.filter(order=order).exists())

    def test_a_seller_at_level_4_can_still_record_a_payment_on_an_already_locked_order(self):
        order = make_order(self.seller, buyer=self.buyer, status="locked", total="4000.00")
        owe(self.account, 600)
        response = self.client.post(f"/api/orders/{order.pk}/pay/", {"amount": "4000.00"}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_cancelling_before_locking_never_charged_a_fee_in_the_first_place(self):
        # CancelOrderView only allows cancelling from "submitted"/"sourcing" — a
        # locked order has no cancel path in the app today (see the note in
        # billing/services.py's refund_order_fee and the summary this phase
        # was reported with). So in practice a fee is never charged before an
        # order becomes uncancellable, and refund_order_fee is exercised
        # directly at the service level (test_services.RefundOrderFeeTests)
        # against the day a cancel-after-lock path exists.
        order = make_order(self.seller, buyer=self.buyer, status="sourcing")
        response = self.client.post(f"/api/orders/{order.pk}/cancel/")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(OrderFee.objects.filter(order=order).exists())
