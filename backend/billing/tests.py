from decimal import Decimal

from django.db import IntegrityError, transaction
from django.test import TestCase

from billing.models import FeeSchedule, OrderFee, Payment, SellerAccount
from billing.services import ensure_account, get_active_schedule
from billing.testing import make_order, make_seller
from billing.utils import account_number_for


class FeeScheduleTests(TestCase):
    def test_the_seed_migration_creates_the_spec_starting_values(self):
        schedule = FeeSchedule.objects.get()
        self.assertEqual(
            (schedule.rate_percent, schedule.round_to_kes, schedule.min_fee_kes, schedule.max_fee_kes, schedule.free_orders_allowance),
            (Decimal("0.500"), 5, Decimal("10.00"), Decimal("250.00"), 3),
        )
        # Off by default — see docs/BILLING_SPEC.md §3 "Buyer fee (built, disabled)".
        self.assertEqual(schedule.buyer_rate_percent, Decimal("0.000"))

    def test_get_active_schedule_returns_the_seeded_row(self):
        self.assertEqual(get_active_schedule().pk, FeeSchedule.objects.get().pk)

    def test_get_active_schedule_creates_the_defaults_if_none_exists(self):
        FeeSchedule.objects.all().delete()
        schedule = get_active_schedule()
        self.assertEqual((schedule.rate_percent, schedule.min_fee_kes), (Decimal("0.500"), Decimal("10.00")))

    def test_get_active_schedule_ignores_an_inactive_row(self):
        FeeSchedule.objects.update(is_active=False)
        fresh = get_active_schedule()
        self.assertNotEqual(fresh.pk, FeeSchedule.objects.filter(is_active=False).get().pk)
        self.assertTrue(fresh.is_active)


class SellerAccountTests(TestCase):
    def test_a_new_seller_has_no_account_until_one_is_asked_for(self):
        seller = make_seller(1)
        self.assertFalse(SellerAccount.objects.filter(seller=seller).exists())

    def test_ensure_account_creates_one_with_an_account_number_and_zero_balance(self):
        seller = make_seller(1)
        account = ensure_account(seller)
        self.assertEqual(account.account_number, f"NYK-{seller.id:04d}")
        self.assertEqual((account.credit_kes, account.free_orders_used, account.debt_since), (0, 0, None))

    def test_ensure_account_never_changes_an_existing_one(self):
        seller = make_seller(1)
        ensure_account(seller)
        SellerAccount.objects.filter(seller=seller).update(credit_kes=Decimal("-42.00"))
        account = ensure_account(seller)
        self.assertEqual(account.credit_kes, Decimal("-42.00"))

    def test_account_number_format(self):
        self.assertEqual(account_number_for(42), "NYK-0042")
        self.assertEqual(account_number_for(12345), "NYK-12345")

    def test_only_one_account_per_seller(self):
        seller = make_seller(1)
        ensure_account(seller)
        with self.assertRaises(IntegrityError), transaction.atomic():
            SellerAccount.objects.create(seller=seller)

    def test_credit_can_go_negative(self):
        seller = make_seller(1)
        account = ensure_account(seller)
        SellerAccount.objects.filter(pk=account.pk).update(credit_kes=Decimal("-100.00"))
        account.refresh_from_db()
        self.assertEqual(account.credit_kes, Decimal("-100.00"))


class OrderFeeAndPaymentTests(TestCase):
    def test_only_one_fee_row_per_order(self):
        seller = make_seller(1)
        order = make_order(seller)
        OrderFee.objects.create(order=order, amount_kes=Decimal("10.00"), status="charged")
        with self.assertRaises(IntegrityError), transaction.atomic():
            OrderFee.objects.create(order=order, amount_kes=Decimal("10.00"), status="charged")

    def test_the_same_payment_reference_can_only_be_stored_once(self):
        Payment.objects.create(reference="PSK_1", amount_kes=Decimal("140.00"))
        with self.assertRaises(IntegrityError), transaction.atomic():
            Payment.objects.create(reference="PSK_1", amount_kes=Decimal("140.00"))

    def test_deleting_a_seller_account_keeps_the_record_of_its_payments(self):
        seller = make_seller(1)
        account = ensure_account(seller)
        payment = Payment.objects.create(reference="PSK_2", amount_kes=Decimal("140.00"), account=account)
        account.delete()
        payment.refresh_from_db()
        self.assertIsNone(payment.account)
