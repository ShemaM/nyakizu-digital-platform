import importlib
from decimal import Decimal
from io import StringIO

from django.apps import apps
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser
from billing.models import CreditEntry, ImmutableLedgerError, OrderFee, SellerAccount
from billing.services import (
    apply_credit_change, charge_order_fee, ensure_account, get_active_schedule,
    ledger_mismatch, refund_order_fee,
)
from billing.testing import make_buyer, make_order, make_seller, set_account


def past_free_orders(account):
    set_account(account, free_orders_used=get_active_schedule().free_orders_allowance)


class ApplyCreditChangeTests(TestCase):
    def setUp(self):
        self.account = ensure_account(make_seller(1))

    def test_moves_the_balance_and_writes_one_entry_with_the_balance_after(self):
        entry = apply_credit_change(self.account, Decimal("140.00"), "top_up", note="test")
        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("140.00"))
        self.assertEqual(
            (entry.kind, entry.amount_kes, entry.balance_after_kes, entry.account_number, entry.note),
            ("top_up", Decimal("140.00"), Decimal("140.00"), self.account.account_number, "test"),
        )

    def test_a_zero_change_is_refused(self):
        with self.assertRaises(ValueError):
            apply_credit_change(self.account, 0, "adjustment")
        self.assertFalse(CreditEntry.objects.exists())

    def test_going_negative_starts_debt_and_coming_back_clears_it(self):
        apply_credit_change(self.account, Decimal("-30.00"), "fee_charged")
        self.account.refresh_from_db()
        self.assertIsNotNone(self.account.debt_since)

        apply_credit_change(self.account, Decimal("30.00"), "top_up")
        self.account.refresh_from_db()
        self.assertIsNone(self.account.debt_since)

    def test_records_who_made_an_adjustment(self):
        staff = CustomUser.objects.create(username="staff", email="staff@example.com", is_staff=True)
        entry = apply_credit_change(self.account, 50, "adjustment", note="Paid cash", user=staff)
        self.assertEqual(entry.created_by, staff)


class LedgerFollowsTheMoneyTests(TestCase):
    def setUp(self):
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)
        past_free_orders(self.account)

    def test_a_charged_fee_writes_a_negative_entry_linked_to_the_fee(self):
        order = make_order(self.seller, total="4000.00")
        fee = charge_order_fee(order)
        entry = CreditEntry.objects.get()
        self.assertEqual((entry.kind, entry.amount_kes, entry.balance_after_kes), ("fee_charged", Decimal("-20.00"), Decimal("-20.00")))
        self.assertEqual(entry.order_fee, fee)

    def test_a_free_order_moves_no_money_so_writes_no_entry(self):
        set_account(self.account, free_orders_used=0)
        charge_order_fee(make_order(self.seller))
        self.assertFalse(CreditEntry.objects.exists())

    def test_a_refund_writes_a_positive_entry(self):
        order = make_order(self.seller, total="4000.00")
        charge_order_fee(order)
        refund_order_fee(order)
        kinds = list(CreditEntry.objects.order_by("id").values_list("kind", "amount_kes"))
        self.assertEqual(kinds, [("fee_charged", Decimal("-20.00")), ("fee_refunded", Decimal("20.00"))])
        self.assertEqual(OrderFee.objects.get(order=order).status, "refunded")

    def test_the_balance_always_equals_the_sum_of_the_entries(self):
        for total in ("4000.00", "10000.00", "2000.00"):
            charge_order_fee(make_order(self.seller, total=total))
        apply_credit_change(self.account, Decimal("500.00"), "top_up")
        refund_order_fee(OrderFee.objects.filter(status="charged").first().order)

        self.assertIsNone(ledger_mismatch(self.account))

    def test_a_balance_changed_behind_the_ledgers_back_is_detected(self):
        apply_credit_change(self.account, Decimal("100.00"), "top_up")
        SellerAccount.objects.filter(pk=self.account.pk).update(credit_kes=Decimal("250.00"))
        self.assertEqual(ledger_mismatch(self.account), Decimal("150.00"))


class ImmutableEntriesTests(TestCase):
    def setUp(self):
        account = ensure_account(make_seller(1))
        self.entry = apply_credit_change(account, 100, "top_up")

    def test_an_entry_cannot_be_edited(self):
        self.entry.note = "changed"
        with self.assertRaises(ImmutableLedgerError):
            self.entry.save()
        self.entry.refresh_from_db()
        self.assertEqual(self.entry.note, "")

    def test_an_entry_cannot_be_deleted(self):
        with self.assertRaises(ImmutableLedgerError):
            self.entry.delete()
        self.assertTrue(CreditEntry.objects.filter(pk=self.entry.pk).exists())

    def test_entries_survive_the_account_being_deleted(self):
        account_number = self.entry.account_number
        self.entry.account.delete()
        self.entry.refresh_from_db()
        self.assertEqual((self.entry.account, self.entry.account_number), (None, account_number))


class OpeningBalanceMigrationTests(TestCase):
    def setUp(self):
        self.migration = importlib.import_module("billing.migrations.0003_credit_entry")

    def test_an_account_with_credit_but_no_entries_gets_one_opening_entry(self):
        owing = ensure_account(make_seller(1))
        set_account(owing, credit_kes=Decimal("-75.00"))
        untouched = ensure_account(make_seller(2))

        self.migration.opening_balances(apps, None)
        self.migration.opening_balances(apps, None)

        self.assertEqual(CreditEntry.objects.filter(account=owing).count(), 1)
        self.assertFalse(CreditEntry.objects.filter(account=untouched).exists())
        self.assertIsNone(ledger_mismatch(owing))


class CheckLedgerCommandTests(TestCase):
    def run_command(self):
        out = StringIO()
        call_command("check_billing_ledger", stdout=out)
        return out.getvalue()

    def test_reports_ok_when_every_account_reconciles(self):
        apply_credit_change(ensure_account(make_seller(1)), 100, "top_up")
        self.assertIn("Ledger OK: 1 account(s) reconcile.", self.run_command())

    def test_fails_and_names_the_account_that_does_not(self):
        account = ensure_account(make_seller(1))
        apply_credit_change(account, 100, "top_up")
        SellerAccount.objects.filter(pk=account.pk).update(credit_kes=Decimal("999.00"))
        with self.assertRaisesMessage(CommandError, account.account_number):
            self.run_command()


class LedgerEndpointTests(TestCase):
    def setUp(self):
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)
        self.client = APIClient()
        self.client.force_authenticate(self.seller.user)

    def test_needs_an_approved_seller(self):
        self.assertEqual(APIClient().get("/api/billing/ledger/").status_code, 403)
        self.client.force_authenticate(make_buyer("b"))
        self.assertEqual(self.client.get("/api/billing/ledger/").status_code, 403)

    def test_lists_the_sellers_own_entries_newest_first(self):
        past_free_orders(self.account)
        order = make_order(self.seller, total="4000.00")
        charge_order_fee(order)
        apply_credit_change(self.account, Decimal("100.00"), "top_up", note="M-Pesa")

        data = self.client.get("/api/billing/ledger/").json()

        self.assertEqual([row["kind"] for row in data], ["top_up", "fee_charged"])
        self.assertEqual((data[0]["amount_kes"], data[0]["balance_after_kes"], data[0]["note"]), ("100.00", "80.00", "M-Pesa"))
        self.assertEqual((data[1]["amount_kes"], data[1]["order_id"]), ("-20.00", order.id))
        self.assertIsNone(data[0]["order_id"])

    def test_never_shows_another_sellers_entries(self):
        other = ensure_account(make_seller(2))
        apply_credit_change(other, 500, "top_up")
        self.assertEqual(self.client.get("/api/billing/ledger/").json(), [])

    def test_shows_at_most_the_last_50(self):
        for _ in range(55):
            apply_credit_change(self.account, 1, "top_up")
        self.assertEqual(len(self.client.get("/api/billing/ledger/").json()), 50)
