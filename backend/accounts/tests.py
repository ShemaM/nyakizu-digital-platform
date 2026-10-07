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
            "phone": "+254701000001",
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
            "phone": "+254701000002",
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

    def test_seller_approving_buyer_notifies_buyer(self):
        rel = BuyerSellerRelationship.objects.create(
            buyer=self.buyer, seller=self.store, status="pending"
        )
        self.client.force_authenticate(self.seller)

        response = self.client.post(
            f"/api/accounts/relationships/{rel.id}/resolve/",
            {"action": "approve"},
        )

        self.assertEqual(response.status_code, 200)
        rel.refresh_from_db()
        self.assertEqual(rel.status, "approved")
        self.assertIsNotNone(rel.resolved_at)

        # Check response has new fields
        self.assertEqual(response.data.get("seller_username"), self.seller.username)
        self.assertIsNotNone(response.data.get("resolved_at"))

        # Verify email dispatched to buyer
        buyer_mail = [m for m in mail.outbox if self.buyer.email in m.to]
        self.assertEqual(len(buyer_mail), 1)
        self.assertIn(self.store.store_name, buyer_mail[0].subject)
        self.assertIn("approved", buyer_mail[0].body.lower())
        
        # Verify branded HTML alternative is attached
        self.assertEqual(len(buyer_mail[0].alternatives), 1)
        html_content, mimetype = buyer_mail[0].alternatives[0]
        self.assertEqual(mimetype, "text/html")
        self.assertIn("NYAKIZU", html_content)
        self.assertIn("DIGITAL", html_content)
        self.assertIn("The Nyakizu Team", html_content)
        self.assertIn("Nyakizu Digital Market Ltd", html_content)
        self.assertIn("icon-192.png", html_content)
        self.assertIn("Open Store &amp; Start Ordering", html_content)


class BrandedEmailUnitTests(TestCase):
    def test_build_branded_email_html_structure(self):
        from nyakizu.emailing import build_branded_email_html

        subject = "Welcome to Nyakizu Market"
        message = (
            "Hello John,\n\n"
            "Store: Super Supplies\n"
            "Status: Approved\n\n"
            "1. First step\n"
            "2. Second step\n\n"
            "Open your store: https://nyakizudigital.me/seller/dashboard\n\n"
            "Warm regards,\nThe Nyakizu Team"
        )
        html_output = build_branded_email_html(
            subject=subject,
            message=message,
            cta_url="https://nyakizudigital.me/seller/dashboard",
            cta_text="Access Seller Dashboard",
        )

        self.assertIn("NYAKIZU", html_output)
        self.assertIn("DIGITAL", html_output)
        self.assertIn("#0A1F10", html_output)  # Forest Green
        self.assertIn("#10B981", html_output)  # Emerald Green
        self.assertIn("Access Seller Dashboard", html_output)
        self.assertIn("https://nyakizudigital.me/seller/dashboard", html_output)
        self.assertIn("Super Supplies", html_output)
        self.assertIn("The Nyakizu Team", html_output)
        self.assertIn("Nyakizu Digital Market Ltd &middot; Nairobi CBD", html_output)
        self.assertIn("support@nyakizudigital.me", html_output)


