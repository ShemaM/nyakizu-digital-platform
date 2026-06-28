from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser, SellerProfile
from products.models import Category, Product


class ProductPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Cases", slug="cases")

        self.seller = CustomUser.objects.create_user(
            username="seller",
            email="seller@example.com",
            password="Seller1234!",
            role="seller",
            is_email_verified=True,
        )
        self.store = SellerProfile.objects.create(
            user=self.seller,
            store_name="Approved Store",
            approval_status="approved",
            is_verified=True,
        )

        self.other_seller = CustomUser.objects.create_user(
            username="other-seller",
            email="other@example.com",
            password="Seller1234!",
            role="seller",
            is_email_verified=True,
        )
        SellerProfile.objects.create(
            user=self.other_seller,
            store_name="Other Store",
            approval_status="approved",
            is_verified=True,
        )

        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="Clear Case",
            price=Decimal("250.00"),
            stock_quantity=10,
            status="available",
        )

    def test_only_approved_seller_can_create_product(self):
        self.store.approval_status = "pending"
        self.store.save(update_fields=["approval_status"])
        self.client.force_authenticate(self.seller)

        response = self.client.post(
            "/api/products/",
            {
                "category": self.category.id,
                "name": "Draft Charger",
                "price": "100.00",
                "stock_quantity": 3,
                "status": "available",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_seller_cannot_update_another_sellers_product(self):
        self.client.force_authenticate(self.other_seller)

        response = self.client.patch(
            f"/api/products/{self.product.id}/",
            {"price": "999.00"},
            format="json",
        )

        self.assertEqual(response.status_code, 404)

    def test_public_product_list_hides_unapproved_seller_products(self):
        self.store.approval_status = "pending"
        self.store.save(update_fields=["approval_status"])

        response = self.client.get("/api/products/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)
