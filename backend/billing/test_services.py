from datetime import timedelta
from decimal import Decimal

from django.test import TestCase, override_settings
from django.utils import timezone

from billing.models import FeeSchedule, OrderFee
from billing.services import (
    charge_order_fee, compute_fee, enforcement_level, ensure_account, get_active_schedule, refund_order_fee,
)
from billing.testing import make_order, make_seller, set_account


class ComputeFeeTests(TestCase):
    def setUp(self):
        self.schedule = get_active_schedule()

    def fee(self, total, **overrides):
        if overrides:
            FeeSchedule.objects.filter(pk=self.schedule.pk).update(**overrides)
            self.schedule.refresh_from_db()
        return compute_fee(Decimal(str(total)), self.schedule)

    def test_the_worked_examples_from_the_spec(self):
        # (order total, expected fee) at rate=0.5%, round_to=5, min=10, max=250
        cases = [
            (2000, 10), (4000, 20), (10000, 50), (20000, 100),
            (50000, 250), (100000, 250),  # capped
        ]
        for total, expected in cases:
            with self.subTest(total=total):
                self.assertEqual(self.fee(total), Decimal(expected))

    def test_rounds_up_to_the_next_5_never_down(self):
        # 2100 * 0.5% = 10.5 -> rounds up to 15, not down to 10.
        self.assertEqual(self.fee(2100), Decimal("15"))
        # 2001 * 0.5% = 10.005 -> still rounds up to 15.
        self.assertEqual(self.fee(2001), Decimal("15"))

    def test_the_minimum_fee_applies_below_it(self):
        self.assertEqual(self.fee(1000), Decimal("10"))  # raw fee would be exactly 5
        self.assertEqual(self.fee(1), Decimal("10"))

    def test_zero_or_negative_total_is_never_charged(self):
        self.assertEqual(self.fee(0), Decimal("0"))
        self.assertEqual(self.fee(-500), Decimal("0"))

    def test_paying_more_never_costs_less(self):
        fees = [self.fee(total) for total in range(0, 60000, 137)]
        self.assertEqual(fees, sorted(fees))

    def test_rate_min_max_and_round_to_all_come_from_the_schedule_row(self):
        self.assertEqual(self.fee(1000, rate_percent=Decimal("1.000"), round_to_kes=1, min_fee_kes=0, max_fee_kes=999), Decimal("10"))
        self.assertEqual(self.fee(100000, max_fee_kes=Decimal("300.00")), Decimal("300"))

    def test_the_buyer_fee_is_off_by_default(self):
        self.assertEqual(compute_fee(Decimal("10000"), self.schedule, buyer=True), Decimal("0"))

    def test_the_buyer_fee_uses_its_own_fields_once_enabled(self):
        FeeSchedule.objects.filter(pk=self.schedule.pk).update(
            buyer_rate_percent=Decimal("0.500"), buyer_round_to_kes=5,
            buyer_min_fee_kes=Decimal("5.00"), buyer_max_fee_kes=Decimal("50.00"),
        )
        self.schedule.refresh_from_db()
        self.assertEqual(compute_fee(Decimal("2000"), self.schedule, buyer=True), Decimal("10"))


class ChargeOrderFeeTests(TestCase):
    def setUp(self):
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)

    def test_the_first_orders_are_free(self):
        for i in range(3):
            order = make_order(self.seller, total="4000.00")
            fee = charge_order_fee(order)
            self.assertEqual((fee.status, fee.amount_kes), ("waived_free", Decimal("0.00")))
        self.account.refresh_from_db()
        self.assertEqual((self.account.free_orders_used, self.account.credit_kes), (3, 0))

    def test_the_fourth_order_is_charged_and_deducted_from_credit(self):
        for _ in range(3):
            charge_order_fee(make_order(self.seller, total="4000.00"))
        set_account(self.account, credit_kes=Decimal("100.00"))

        fee = charge_order_fee(make_order(self.seller, total="4000.00"))

        self.assertEqual((fee.status, fee.amount_kes), ("charged", Decimal("20.00")))
        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("80.00"))

    def test_free_orders_are_never_re_granted_once_used(self):
        for _ in range(4):
            charge_order_fee(make_order(self.seller, total="4000.00"))
        self.account.refresh_from_db()
        self.assertEqual(self.account.free_orders_used, 3)

    def test_a_charge_can_push_credit_negative_and_records_when_that_started(self):
        now = timezone.now()
        order = make_order(self.seller, total="4000.00")
        for _ in range(3):
            charge_order_fee(make_order(self.seller, total="1.00"))  # use up the free orders first

        charge_order_fee(order, now=now)

        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("-20.00"))
        self.assertIsNotNone(self.account.debt_since)

    def test_charging_the_same_order_twice_only_charges_once(self):
        for _ in range(3):
            charge_order_fee(make_order(self.seller, total="1.00"))
        order = make_order(self.seller, total="4000.00")

        first = charge_order_fee(order)
        second = charge_order_fee(order)

        self.assertEqual(first.pk, second.pk)
        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("-20.00"))

    def test_an_order_whose_seller_has_no_store_profile_is_not_charged(self):
        from accounts.models import CustomUser
        bare = CustomUser.objects.create(username="bare", email="bare@example.com", role="seller")
        order = make_order(self.seller)
        order.seller = bare
        order.save(update_fields=["seller"])
        self.assertIsNone(charge_order_fee(order))


class RefundOrderFeeTests(TestCase):
    def setUp(self):
        self.seller = make_seller(1)
        self.account = ensure_account(self.seller)
        for _ in range(3):
            charge_order_fee(make_order(self.seller, total="1.00"))  # use up the free orders
        set_account(self.account, credit_kes=Decimal("100.00"))
        self.order = make_order(self.seller, total="4000.00")
        self.fee = charge_order_fee(self.order)

    def test_refunds_a_charged_fee_when_nothing_has_been_paid(self):
        refunded = refund_order_fee(self.order)
        self.assertEqual(refunded.status, "refunded")
        self.assertIsNotNone(refunded.refunded_at)
        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("100.00"))

    def test_does_not_refund_once_something_has_been_paid(self):
        self.order.amount_paid = Decimal("500.00")
        self.order.save(update_fields=["amount_paid"])

        self.assertIsNone(refund_order_fee(self.order))

        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("80.00"))
        self.assertEqual(OrderFee.objects.get(order=self.order).status, "charged")

    def test_refunding_twice_only_refunds_once(self):
        refund_order_fee(self.order)
        self.assertIsNone(refund_order_fee(self.order))
        self.account.refresh_from_db()
        self.assertEqual(self.account.credit_kes, Decimal("100.00"))

    def test_a_waived_free_order_has_nothing_to_refund(self):
        free_order = make_order(self.seller, total="1.00")
        # Already has a "waived_free" OrderFee from setUp's free-order loop.
        self.assertIsNone(refund_order_fee(free_order))

    def test_an_order_with_no_fee_at_all_has_nothing_to_refund(self):
        self.assertIsNone(refund_order_fee(make_order(self.seller)))


class EnforcementLevelTests(TestCase):
    def setUp(self):
        self.now = timezone.now()
        self.account = ensure_account(make_seller(1))

    def level(self, **fields):
        set_account(self.account, **fields)
        return enforcement_level(self.account, self.now)

    def test_level_0_plenty_of_credit(self):
        self.assertEqual(self.level(credit_kes=Decimal("150.00")), 0)

    def test_level_0_a_brand_new_seller_on_their_free_orders_is_never_low_credit(self):
        # 0 credit and 0 free_orders_used — this is normal, not "low".
        self.assertEqual(self.level(credit_kes=Decimal("0.00")), 0)

    def test_level_1_low_but_not_negative_once_the_free_orders_are_used_up(self):
        self.assertEqual(self.level(credit_kes=Decimal("50.00"), free_orders_used=3), 1)

    def test_level_2_anything_owed_but_under_the_level_3_thresholds(self):
        self.assertEqual(self.level(credit_kes=Decimal("-50.00"), debt_since=self.now), 2)

    def test_level_3_owed_enough(self):
        self.assertEqual(self.level(credit_kes=Decimal("-201.00"), debt_since=self.now), 3)

    def test_level_3_owed_long_enough_even_if_the_amount_is_small(self):
        self.assertEqual(self.level(credit_kes=Decimal("-1.00"), debt_since=self.now - timedelta(days=8)), 3)

    def test_level_4_owed_a_lot(self):
        self.assertEqual(self.level(credit_kes=Decimal("-501.00"), debt_since=self.now), 4)

    def test_level_4_owed_for_a_long_time_even_if_the_amount_is_small(self):
        self.assertEqual(self.level(credit_kes=Decimal("-1.00"), debt_since=self.now - timedelta(days=15)), 4)

    def test_exactly_at_a_threshold_does_not_escalate(self):
        self.assertEqual(self.level(credit_kes=Decimal("-200.00"), debt_since=self.now), 2)
        self.assertEqual(self.level(credit_kes=Decimal("-500.00"), debt_since=self.now - timedelta(days=7)), 3)

    @override_settings(BILLING_LOW_CREDIT_KES=500, BILLING_LEVEL3_OWED_KES=10, BILLING_LEVEL4_OWED_KES=50)
    def test_thresholds_come_from_settings(self):
        self.assertEqual(self.level(credit_kes=Decimal("400.00"), free_orders_used=3), 1)
        self.assertEqual(self.level(credit_kes=Decimal("-11.00"), debt_since=self.now), 3)
