from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from accounts.models import CustomUser
from orders.models import Order


class AdminDashboardTests(TestCase):
    def setUp(self):
        staff = CustomUser.objects.create(username="root", email="root@example.com", is_staff=True, is_superuser=True)
        self.client.force_login(staff)
        self.buyer = CustomUser.objects.create(username="buyer", email="buyer@example.com", role="buyer")

    def test_the_home_page_loads_and_warns_when_trade_volume_drops(self):
        # An order in the previous 30-day window and none since: volume fell 100%.
        order = Order.objects.create(buyer=self.buyer, total_price=Decimal("1000"), status="cleared")
        Order.objects.filter(pk=order.pk).update(created_at=timezone.now() - timedelta(days=45))

        response = self.client.get("/admin/")

        self.assertEqual(response.status_code, 200)
        messages = [alert["message"] for alert in response.context["alerts"]]
        self.assertIn("Trade volume dropped 100% vs. the previous period.", messages)
