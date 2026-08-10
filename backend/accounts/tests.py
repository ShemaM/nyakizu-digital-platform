from django.core import mail
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser, BuyerProfile, SellerProfile, BuyerSellerRelationship


class AccountPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.buyer = CustomUser.objects.create_user(
            username="buyer",
            email="buyer@example.com",
            password="Buyer1234!",
            role="buyer",
            is_email_verified=True,
        )
        self.buyer_profile = BuyerProfile.objects.create(
            user=self.buyer,
            location="Eastleigh",
            business_type="Hawker",
        )

        self.other_buyer = CustomUser.objects.create_user(
            username="other-buyer",
            email="other@example.com",
            password="Buyer1234!",
            role="buyer",
            is_email_verified=True,
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
            approval_status="approved",
            is_verified=True,
        )

        self.admin = CustomUser.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="Admin1234!",
            role="admin",
            is_staff=True,
            is_active=True,
        )

    def test_buyer_profile_is_private_to_owner(self):
        self.client.force_authenticate(self.other_buyer)

        response = self.client.get(f"/api/accounts/buyers/{self.buyer_profile.id}/")

        self.assertEqual(response.status_code, 404)

    def test_unverified_buyer_cannot_request_store_access(self):
        self.buyer.is_email_verified = False
        self.buyer.save(update_fields=["is_email_verified"])
        self.client.force_authenticate(self.buyer)

        response = self.client.post(
            f"/api/accounts/sellers/{self.store.id}/request-access/"
        )

        self.assertEqual(response.status_code, 403)

    def test_seller_can_see_own_pending_store_but_public_cannot(self):
        self.store.approval_status = "pending"
        self.store.save(update_fields=["approval_status"])

        public_response = self.client.get(f"/api/accounts/sellers/{self.store.id}/")
        self.client.force_authenticate(self.seller)
        owner_response = self.client.get(f"/api/accounts/sellers/{self.store.id}/")

        self.assertEqual(public_response.status_code, 404)
        self.assertEqual(owner_response.status_code, 200)

    def test_buyer_signup_notifies_admins(self):
        response = self.client.post("/api/accounts/register/", {
            "full_name": "New Buyer",
            "username": "new-buyer",
            "email": "newbuyer@example.com",
            "phone": "",
            "password": "Buyer1234!",
            "role": "buyer",
            "location": "Kawangware",
            "business_type": "Hawker",
        })

        self.assertEqual(response.status_code, 201)
        admin_mail = [m for m in mail.outbox if self.admin.email in m.to]
        self.assertEqual(len(admin_mail), 1)
        self.assertIn("New Buyer", admin_mail[0].body)

    def test_seller_signup_notifies_admins(self):
        response = self.client.post("/api/accounts/register/", {
            "full_name": "New Seller",
            "username": "new-seller",
            "email": "newseller@example.com",
            "phone": "",
            "password": "Seller1234!",
            "role": "seller",
            "shop_name": "New Shop",
            "shop_location": "Gikomba",
            "categories": [],
        })

        self.assertEqual(response.status_code, 201)
        admin_mail = [m for m in mail.outbox if self.admin.email in m.to]
        self.assertEqual(len(admin_mail), 1)
        self.assertIn("New Shop", admin_mail[0].body)

    def test_buyer_requesting_seller_access_notifies_seller(self):
        self.client.force_authenticate(self.buyer)

        response = self.client.post(
            "/api/accounts/relationships/", {"seller_id": self.store.id}
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            BuyerSellerRelationship.objects.filter(
                buyer=self.buyer, seller=self.store
            ).count(),
            1,
        )
        seller_mail = [m for m in mail.outbox if self.seller.email in m.to]
        self.assertEqual(len(seller_mail), 1)
        self.assertIn(self.buyer.username, seller_mail[0].body)

    def test_repeated_access_request_does_not_resend_notification(self):
        BuyerSellerRelationship.objects.create(buyer=self.buyer, seller=self.store)
        self.client.force_authenticate(self.buyer)

        response = self.client.post(
            "/api/accounts/relationships/", {"seller_id": self.store.id}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)
