from decimal import Decimal

from django.contrib import admin
from django.test import TestCase

from accounts.models import CustomUser
from billing.admin import SellerAccountAdmin
from billing.models import CreditEntry, SellerAccount
from billing.services import ensure_account, ledger_mismatch
from billing.testing import make_seller, set_account


class SellerAccountAdminTests(TestCase):
    def setUp(self):
        self.staff = CustomUser.objects.create(username="root", email="root@example.com", is_staff=True, is_superuser=True)
        self.client.force_login(self.staff)

        self.owing = make_seller(1)
        set_account(ensure_account(self.owing), credit_kes=Decimal("-600.00"))
        self.healthy = make_seller(2)
        ensure_account(self.healthy)

    def changelist(self, query=""):
        response = self.client.get("/admin/billing/selleraccount/" + query)
        self.assertEqual(response.status_code, 200)
        return response

    def change_url(self, seller):
        return f"/admin/billing/selleraccount/{SellerAccount.objects.get(seller=seller).pk}/change/"

    def test_the_list_shows_enforcement_level_worked_out_from_the_balance(self):
        response = self.changelist()
        self.assertContains(response, "Enforcement now")

        model_admin = SellerAccountAdmin(SellerAccount, admin.site)
        rows = {row.seller_id: row for row in response.context["cl"].result_list}
        self.assertEqual(model_admin.enforcement_now(rows[self.owing.id]), 4)
        self.assertEqual(model_admin.enforcement_now(rows[self.healthy.id]), 0)

    def test_the_account_number_seller_and_credit_cannot_be_edited_directly(self):
        response = self.client.get(self.change_url(self.owing))
        self.assertEqual(response.status_code, 200)
        for name in ("account_number", "seller", "credit_kes"):
            self.assertNotContains(response, f'name="{name}"')

    def test_the_account_page_links_to_its_ledger(self):
        response = self.client.get(self.change_url(self.healthy))
        account_number = SellerAccount.objects.get(seller=self.healthy).account_number
        self.assertContains(response, f"creditentry/?q={account_number}")

    def adjust(self, seller, amount, reason):
        return self.client.post(
            self.change_url(seller),
            {"free_orders_used": 0, "adjust_credit_by": amount, "adjust_reason": reason, "_save": "Save"},
        )

    def test_an_adjustment_with_a_reason_moves_the_balance_and_writes_a_ledger_entry(self):
        set_account(SellerAccount.objects.get(seller=self.owing), credit_kes=Decimal("0.00"), debt_since=None)

        response = self.adjust(self.owing, "300.00", "Paid KES 300 by M-Pesa to the till")

        self.assertEqual(response.status_code, 302)
        account = SellerAccount.objects.get(seller=self.owing)
        self.assertEqual(account.credit_kes, Decimal("300.00"))
        entry = CreditEntry.objects.get(account=account)
        self.assertEqual(
            (entry.kind, entry.amount_kes, entry.note, entry.created_by),
            ("adjustment", Decimal("300.00"), "Paid KES 300 by M-Pesa to the till", self.staff),
        )
        self.assertIsNone(ledger_mismatch(account))

    def test_an_adjustment_without_a_reason_is_refused_and_changes_nothing(self):
        response = self.adjust(self.healthy, "100.00", "  ")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Say why you are adjusting")
        self.assertFalse(CreditEntry.objects.exists())
        self.assertEqual(SellerAccount.objects.get(seller=self.healthy).credit_kes, 0)

    def test_saving_with_no_adjustment_writes_no_entry(self):
        response = self.adjust(self.healthy, "", "")
        self.assertEqual(response.status_code, 302)
        self.assertFalse(CreditEntry.objects.exists())

    def test_the_ledger_page_lists_entries_and_cannot_be_edited(self):
        set_account(SellerAccount.objects.get(seller=self.healthy), credit_kes=Decimal("0.00"))
        self.adjust(self.healthy, "50.00", "Goodwill credit")
        response = self.client.get("/admin/billing/creditentry/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Adjustment by Nyakizu staff")
        self.assertEqual(self.client.get("/admin/billing/creditentry/add/").status_code, 403)
