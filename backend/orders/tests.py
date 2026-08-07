from decimal import Decimal

from django.core import mail
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser, BuyerProfile, SellerProfile, BuyerSellerRelationship
from orders.models import Order, OrderStatusEvent
from products.models import Category, Product


class OrderWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(
            name="Chargers",
            slug="chargers",
            description="Wall chargers",
        )

        self.buyer = CustomUser.objects.create_user(
            username="buyer",
            email="buyer@example.com",
            password="Buyer1234!",
            role="buyer",
            is_email_verified=True,
        )
        BuyerProfile.objects.create(
            user=self.buyer,
            location="Eastleigh",
            business_type="Hawker",
        )

        self.seller = CustomUser.objects.create_user(
            username="seller",
            email="seller@example.com",
            password="Seller1234!",
            role="seller",
            is_email_verified=True,
        )
        self.store = SellerProfile.objects.create(
            user=self.seller,
            store_name="RNG Plaza",
            location="Nairobi CBD",
            approval_status="approved",
            is_verified=True,
        )

        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="65W Charger",
            price=Decimal("850.00"),
            stock_quantity=5,
            status="available",
        )

    def approve_buyer_for_store(self):
        return BuyerSellerRelationship.objects.create(
            buyer=self.buyer,
            seller=self.store,
            status="approved",
        )

    def test_buyer_must_be_approved_by_seller_before_ordering(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 1}]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("approved", str(response.data).lower())

    def test_trusted_buyer_order_decrements_stock(self):
        self.approve_buyer_for_store()
        self.client.force_authenticate(self.buyer)

        response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 2}]},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 3)
        self.assertEqual(response.data["total_price"], "1700.00")

    def test_cancel_pending_order_restores_reserved_stock(self):
        self.approve_buyer_for_store()
        self.client.force_authenticate(self.buyer)
        create_response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 2}]},
            format="json",
        )

        cancel_response = self.client.post(
            f"/api/orders/{create_response.data['id']}/cancel/"
        )

        self.assertEqual(cancel_response.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 5)

    def test_unapproved_seller_cannot_view_seller_orders(self):
        self.store.approval_status = "pending"
        self.store.save(update_fields=["approval_status"])
        self.client.force_authenticate(self.seller)

        response = self.client.get("/api/orders/seller/")

        self.assertEqual(response.status_code, 403)

    def test_unapproved_seller_cannot_view_order_detail(self):
        self.approve_buyer_for_store()
        self.client.force_authenticate(self.buyer)
        create_response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 1}]},
            format="json",
        )

        self.store.approval_status = "pending"
        self.store.save(update_fields=["approval_status"])
        self.client.force_authenticate(self.seller)
        detail_response = self.client.get(f"/api/orders/{create_response.data['id']}/")

        self.assertEqual(detail_response.status_code, 404)


class OrderNotificationTests(TestCase):
    """Every order status transition should log an OrderStatusEvent and email the buyer."""

    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Chargers", slug="chargers")

        self.buyer = CustomUser.objects.create_user(
            username="buyer", email="buyer@example.com", password="Buyer1234!",
            role="buyer", is_email_verified=True,
        )
        BuyerProfile.objects.create(user=self.buyer, location="Eastleigh", business_type="Hawker")

        self.seller = CustomUser.objects.create_user(
            username="seller", email="seller@example.com", password="Seller1234!",
            role="seller", is_email_verified=True,
        )
        self.store = SellerProfile.objects.create(
            user=self.seller, store_name="RNG Plaza", location="Nairobi CBD",
            approval_status="approved", is_verified=True,
        )
        BuyerSellerRelationship.objects.create(buyer=self.buyer, seller=self.store, status="approved")

        self.product = Product.objects.create(
            seller=self.seller, category=self.category, name="65W Charger",
            price=Decimal("850.00"), stock_quantity=5, status="available",
        )

    def test_placing_order_logs_event_and_emails_buyer_and_seller(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 1}]},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

        order = Order.objects.get(pk=response.data["id"])
        events = list(OrderStatusEvent.objects.filter(order=order).values_list("status", flat=True))
        self.assertEqual(events, ["submitted"])

        recipients = [r for m in mail.outbox for r in m.to]
        self.assertIn(self.buyer.email, recipients)
        self.assertIn(self.seller.email, recipients)

    def test_seller_locking_order_logs_event_and_emails_buyer(self):
        self.client.force_authenticate(self.buyer)
        create_response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 1}]},
            format="json",
        )
        order_id = create_response.data["id"]
        mail.outbox.clear()

        self.client.force_authenticate(self.seller)
        patch_response = self.client.patch(
            f"/api/orders/{order_id}/", {"status": "sourcing"}, format="json"
        )
        self.assertEqual(patch_response.status_code, 200)

        lock_response = self.client.patch(
            f"/api/orders/{order_id}/", {"status": "locked", "final_total": "850.00"}, format="json"
        )
        self.assertEqual(lock_response.status_code, 200)

        events = list(
            OrderStatusEvent.objects.filter(order_id=order_id).order_by("created_at").values_list("status", flat=True)
        )
        self.assertEqual(events, ["submitted", "sourcing", "locked"])
        self.assertEqual(len(mail.outbox), 2)  # one per transition, both to the buyer
        self.assertTrue(all(self.buyer.email in m.to for m in mail.outbox))

    def test_recording_two_partial_payments_emails_buyer_each_time(self):
        self.client.force_authenticate(self.buyer)
        create_response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 1}]},
            format="json",
        )
        order_id = create_response.data["id"]

        self.client.force_authenticate(self.seller)
        self.client.patch(f"/api/orders/{order_id}/", {"status": "sourcing"}, format="json")
        self.client.patch(f"/api/orders/{order_id}/", {"status": "locked"}, format="json")
        mail.outbox.clear()

        first_pay = self.client.post(f"/api/orders/{order_id}/pay/", {"amount": "500.00"}, format="json")
        self.assertEqual(first_pay.status_code, 200)
        self.assertEqual(first_pay.data["status"], "debt_active")

        second_pay = self.client.post(f"/api/orders/{order_id}/pay/", {"amount": "350.00"}, format="json")
        self.assertEqual(second_pay.status_code, 200)
        self.assertEqual(second_pay.data["status"], "cleared")

        # Both payments notify the buyer, even though the first didn't change
        # the order's overall status label away from "debt_active" territory.
        self.assertEqual(len(mail.outbox), 2)
        events = list(
            OrderStatusEvent.objects.filter(order_id=order_id).order_by("created_at").values_list("status", flat=True)
        )
        self.assertEqual(events[-2:], ["debt_active", "cleared"])

    def test_cancelling_order_logs_event_and_emails_buyer(self):
        self.client.force_authenticate(self.buyer)
        create_response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 1}]},
            format="json",
        )
        order_id = create_response.data["id"]
        mail.outbox.clear()

        cancel_response = self.client.post(f"/api/orders/{order_id}/cancel/")
        self.assertEqual(cancel_response.status_code, 200)

        self.assertTrue(OrderStatusEvent.objects.filter(order_id=order_id, status="cancelled").exists())
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(self.buyer.email, mail.outbox[0].to)
