from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser, BuyerProfile, SellerProfile, BuyerSellerRelationship
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
