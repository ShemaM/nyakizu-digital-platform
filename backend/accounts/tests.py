from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser, BuyerProfile, SellerProfile


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
