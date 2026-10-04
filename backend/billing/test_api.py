from decimal import Decimal

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from billing.models import FeeSchedule
from billing.services import charge_order_fee, ensure_account
from billing.testing import make_buyer, make_order, make_seller, set_account


class FeeScheduleEndpointTests(TestCase):
    def test_is_public_and_returns_the_live_formula(self):
        response = APIClient().get("/api/billing/fee-schedule/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(
            (data["rate_percent"], data["round_to_kes"], data["min_fee_kes"], data["max_fee_kes"], data["free_orders_allowance"]),
            ("0.500", 5, "10.00", "250.00", 3),
        )
        self.assertEqual(data["buyer_rate_percent"], "0.000")

    def test_reflects_a_changed_rate_immediately(self):
        FeeSchedule.objects.update(rate_percent=Decimal("1.000"), max_fee_kes=Decimal("300.00"))
        data = APIClient().get("/api/billing/fee-schedule/").json()
        self.assertEqual((data["rate_percent"], data["max_fee_kes"]), ("1.000", "300.00"))


class MeEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)
        self.client.force_authenticate(self.seller.user)

    def get(self):
        return self.client.get("/api/billing/me/")

    def test_needs_a_login(self):
        self.assertEqual(APIClient().get("/api/billing/me/").status_code, 403)

    def test_buyers_are_refused(self):
        self.client.force_authenticate(make_buyer("b"))
        self.assertEqual(self.get().status_code, 403)

    def test_sellers_whose_store_is_not_approved_yet_are_refused(self):
        self.client.force_authenticate(make_seller(2, "pending").user)
        self.assertEqual(self.get().status_code, 403)

    def test_a_new_seller_sees_a_zero_balance_and_their_account_number(self):
        data = self.get().json()
        self.assertEqual(data["account_number"], f"NYK-{self.seller.id:04d}")
        self.assertEqual((data["credit_kes"], data["free_orders_used"], data["free_orders_remaining"]), ("0.00", 0, 3))
        self.assertEqual((data["enforcement_level"], data["debt_since"]), (0, None))
        self.assertIn("fee_schedule", data)
        self.assertEqual(data["fee_schedule"]["min_fee_kes"], "10.00")
        self.assertEqual((data["min_topup_kes"], data["max_topup_kes"]), (50, 20000))

    def test_shows_free_orders_used_up(self):
        for _ in range(2):
            charge_order_fee(make_order(self.seller, total="4000.00"))
        data = self.get().json()
        self.assertEqual((data["free_orders_used"], data["free_orders_remaining"]), (2, 1))

    def test_shows_a_negative_balance_and_its_enforcement_level(self):
        set_account(self.account, credit_kes=Decimal("-600.00"))
        data = self.get().json()
        self.assertEqual((data["credit_kes"], data["enforcement_level"]), ("-600.00", 4))

    @override_settings(BILLING_ENFORCEMENT_ENABLED=True, BILLING_CHARGING_ENABLED=True)
    def test_reports_whether_charging_and_enforcement_are_on(self):
        data = self.get().json()
        self.assertTrue(data["enforcement_enabled"])
        self.assertTrue(data["charging_enabled"])

    @override_settings(BILLING_ENFORCEMENT_ENABLED=False, BILLING_CHARGING_ENABLED=False)
    def test_reports_both_switches_off_by_default(self):
        data = self.get().json()
        self.assertFalse(data["enforcement_enabled"])
        self.assertFalse(data["charging_enabled"])


class FeeScheduleExamplesAndQuoteTests(TestCase):
    def get(self, query=""):
        return APIClient().get(f"/api/billing/fee-schedule/{query}")

    def test_includes_worked_examples_computed_by_the_real_formula(self):
        examples = {e["order_total_kes"]: e["fee_kes"] for e in self.get().json()["examples"]}
        # 0.5% rounded up to KES 5, min 10, max 250: the floor, the middle, and the cap.
        self.assertEqual(examples["1000.00"], "10.00")
        self.assertEqual(examples["5000.00"], "25.00")
        self.assertEqual(examples["100000.00"], "250.00")

    def test_examples_follow_a_changed_schedule(self):
        FeeSchedule.objects.update(rate_percent=Decimal("1.000"))
        examples = {e["order_total_kes"]: e["fee_kes"] for e in self.get().json()["examples"]}
        self.assertEqual(examples["5000.00"], "50.00")

    def test_no_quote_unless_asked(self):
        self.assertNotIn("quote", self.get().json())

    def test_quotes_an_order_total(self):
        data = self.get("?total=4000").json()
        self.assertEqual(data["quote"], {"order_total_kes": "4000.00", "fee_kes": "20.00"})

    def test_rejects_totals_that_make_no_sense(self):
        for bad in ("abc", "-5", "0", "NaN", "Infinity", "99999999999", ""):
            with self.subTest(total=bad):
                self.assertEqual(self.get(f"?total={bad}").status_code, 400)
