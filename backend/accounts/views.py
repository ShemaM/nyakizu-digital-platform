from django.conf import settings
from django.db.models import Q
from django.core.mail import send_mail
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout

from .models import CustomUser, BuyerProfile, SellerProfile, BuyerStoreFollow, BuyerSellerRelationship
from products.models import Product
from .permissions import is_admin_user, is_verified_buyer, is_approved_seller
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    AvatarUploadSerializer,
    BuyerProfileSerializer,
    SellerProfileSerializer,
    BuyerStoreFollowSerializer,
    CommunityActivitySerializer,
    BuyerSellerRelationshipSerializer,
)


class RegisterView(APIView):
    """
    POST /api/accounts/register/

    Buyer:  { full_name, email, phone, password, role, location, main_supplier, business_type }
    Seller: { full_name, email, phone, password, role, shop_name, shop_location, categories[] }

    Creates the user and sends a verification email.

    In DEBUG we return verification_token to keep local demos easy to test.
    In normal environments the token should live only in the email link.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = user.generate_verify_token()

            try:
                verify_url = (
                    f"{getattr(settings, 'FRONTEND_VERIFY_BASE_URL', 'http://localhost:3000')}/"
                    f"verify-email/?token={token}"
                )

                subject = "Verify your email for Nyakizu Digital Market"
                message = (
                    "Welcome to Nyakizu!\n\n"
                    "Please verify your email by opening the link below:\n"
                    f"{verify_url}\n\n"
                    "If you did not create an account, you can ignore this message."
                )

                send_mail(
                    subject=subject,
                    message=message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception:
                # Keep registration functional; login will still be blocked until email is verified.
                # We want the traceback in server logs.
                import traceback
                traceback.print_exc()

            if user.role == "seller":
                self._notify_admins_new_seller(user)

            data = UserSerializer(user, context={"request": request}).data
            if settings.DEBUG:
                data["verification_token"] = token
            return Response(data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _notify_admins_new_seller(self, user):
        """Instantly alert every active staff account that a new seller needs review."""
        staff_emails = list(
            CustomUser.objects.filter(is_staff=True, is_active=True)
            .exclude(email="")
            .values_list("email", flat=True)
        )
        if not staff_emails:
            return

        try:
            profile = user.seller_profile
            review_url = f"{getattr(settings, 'FRONTEND_VERIFY_BASE_URL', 'http://localhost:3000')}/admin/verify"

            subject = f"New seller awaiting approval: {profile.store_name}"
            message = (
                f"A new seller has signed up and is waiting for approval.\n\n"
                f"Store name: {profile.store_name}\n"
                f"Location:   {profile.location or '—'}\n"
                f"Categories: {', '.join(profile.categories) or '—'}\n"
                f"Owner:      {user.get_full_name() or user.username}\n"
                f"Phone:      {user.phone_number or '—'}\n"
                f"Email:      {user.email}\n\n"
                f"Review and approve or reject here:\n{review_url}\n"
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                recipient_list=staff_emails,
                fail_silently=False,
            )
        except Exception:
            import traceback
            traceback.print_exc()



class ResendVerificationEmailView(APIView):
    """
    POST /api/accounts/resend-verification/
    Body: { email }

    Regenerates the verification token and re-sends the email — for buyers
    or sellers who signed up but never got (or lost) the original link.

    Always returns the same generic message regardless of whether the email
    exists or is already verified, so this endpoint can't be used to probe
    which addresses have an account.
    """
    permission_classes = [permissions.AllowAny]

    GENERIC_MESSAGE = "If that email exists and is not verified yet, we have sent a new link."

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        if not email:
            return Response({"error": "Enter your email address."}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.filter(email__iexact=email).first()
        if user and not user.is_email_verified:
            token = user.generate_verify_token()
            try:
                verify_url = (
                    f"{getattr(settings, 'FRONTEND_VERIFY_BASE_URL', 'http://localhost:3000')}/"
                    f"verify-email/?token={token}"
                )
                send_mail(
                    subject="Your Nyakizu verification link",
                    message=(
                        "Here is your new verification link:\n\n"
                        f"{verify_url}\n\n"
                        "If you did not ask for this, you can ignore this message."
                    ),
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception:
                import traceback
                traceback.print_exc()

        return Response({"message": self.GENERIC_MESSAGE})


class VerifyEmailView(APIView):
    """
    GET /api/accounts/verify-email/?token=<token>
    Marks the user's email as verified.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = request.query_params.get("token", "")
        user  = CustomUser.objects.filter(email_verify_token=token).first()

        if not user or not user.verify_email_token_valid(token):
            return Response(
                {"error": "Invalid or expired verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_email_verified   = True
        user.email_verify_token  = ""
        user.save(update_fields=["is_email_verified", "email_verify_token"])

        return Response({"message": "Email verified. You can now sign in."})


class LoginView(APIView):
    """
    POST /api/accounts/login/
    Accepts { phone, password } — phone is used as the identifier.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get("identifier") or request.data.get("phone") or request.data.get("username", "")
        password   = request.data.get("password", "")

        user_obj = (
            CustomUser.objects.filter(phone_number=identifier).first()
            or CustomUser.objects.filter(username=identifier).first()
            or CustomUser.objects.filter(email=identifier).first()
        )

        if not user_obj or not user_obj.check_password(password):
            return Response(
                {"error": "Incorrect phone number or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Staff/superuser accounts are created via `createsuperuser`, which never
        # runs the register-flow email-verify step — so `is_email_verified` stays
        # False forever with no way to flip it. Exempt them from this gate.
        if not user_obj.is_email_verified and not user_obj.is_staff:
            return Response(
                {"error": "Please verify your email before signing in."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Multiple AUTHENTICATION_BACKENDS are configured (ModelBackend + allauth's
        # AuthenticationBackend), so Django can't infer which one authenticated this
        # user when we log them in manually via check_password() rather than
        # django.contrib.auth.authenticate(). Pin it explicitly to ModelBackend,
        # which is the backend whose logic (check_password against CustomUser) we
        # just replicated above.
        login(request, user_obj, backend='django.contrib.auth.backends.ModelBackend')
        return Response(UserSerializer(user_obj, context={"request": request}).data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out."})


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        """PATCH /api/accounts/me/ — upload or replace the signed-in user's avatar."""
        serializer = AvatarUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if user.avatar:
            user.avatar.delete(save=False)
        user.avatar = serializer.validated_data["avatar"]
        user.save(update_fields=["avatar"])

        return Response(UserSerializer(user, context={"request": request}).data)


class UserListView(APIView):
    """
    GET /api/accounts/users/
    Admin only. Lists all users with optional role filter.
    Query params: ?role=buyer|seller|admin
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = CustomUser.objects.all().order_by("-date_joined")
        role = request.query_params.get("role")
        if role:
            users = users.filter(role=role)
        serializer = UserSerializer(users, many=True, context={"request": request})
        return Response(serializer.data)


# ── Seller store views ────────────────────────────────────────────────────────

class SellerProfileListView(generics.ListAPIView):
    """
    GET /api/accounts/sellers/
    GET /api/accounts/sellers/?username=<username>  — look up one store by
    its owner's username (used by the public /store/[slug] page).
    Lists only approved (live) stores. Public.
    """
    serializer_class   = SellerProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = SellerProfile.objects.filter(approval_status="approved")
        username = self.request.query_params.get("username")
        if username:
            qs = qs.filter(user__username=username)
        return qs


class SellerProfileDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/accounts/sellers/<id>/"""
    serializer_class = SellerProfileSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if is_admin_user(user):
            return SellerProfile.objects.all()

        if self.request.method == "GET":
            visible = Q(approval_status="approved")
            if user.is_authenticated:
                visible |= Q(user=user)
            return SellerProfile.objects.filter(visible)

        # Store edits are private to the store owner. Admins are handled above.
        return SellerProfile.objects.filter(user=user)


class PendingSellerListView(generics.ListAPIView):
    """
    GET /api/accounts/sellers/pending/
    Admin only. Lists sellers awaiting or that have been reviewed.
    """
    serializer_class = SellerProfileSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return SellerProfile.objects.filter(
            approval_status__in=["pending", "rejected"]
        ).order_by("-created_at")


class ApproveSellerView(APIView):
    """
    POST /api/accounts/sellers/<id>/approve/
    Admin only. Marks the store as approved and sends an approval email.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            seller = SellerProfile.objects.get(pk=pk)
        except SellerProfile.DoesNotExist:
            return Response({"error": "Store not found."}, status=404)

        seller.approve(by_user=request.user)

        # Send approval email
        try:
            login_url = f"{getattr(settings, 'FRONTEND_VERIFY_BASE_URL', 'http://localhost:3000')}/login"
            subject = "Your Nyakizu Shop Has Been Approved"
            message = (
                f"Dear {seller.user.get_full_name() or seller.user.username},\n\n"
                f"Congratulations! Your store \"{seller.store_name}\" has been approved "
                f"and is now live on the Nyakizu Digital Market.\n\n"
                f"What's next?\n"
                f"1. Sign in to your account: {login_url}\n"
                f"2. Complete your store profile (description, logo, categories)\n"
                f"3. Upload your first products\n"
                f"4. Begin trading with the community\n\n"
                f"We're excited to have you on board!\n\n"
                f"Best regards,\n"
                f"The Nyakizu Team"
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                recipient_list=[seller.user.email],
                fail_silently=True,
            )
        except Exception:
            import traceback
            traceback.print_exc()

        return Response({"message": f"{seller.store_name} is now live."})


class RejectSellerView(APIView):
    """
    POST /api/accounts/sellers/<id>/reject/
    Admin only. Optionally pass { note } in the body.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            seller = SellerProfile.objects.get(pk=pk)
        except SellerProfile.DoesNotExist:
            return Response({"error": "Store not found."}, status=404)

        reason = request.data.get("note", "")
        seller.reject(note=reason)

        # Send rejection email
        try:
            subject = "Update on Your Nyakizu Seller Application"
            message = (
                f"Dear {seller.user.get_full_name() or seller.user.username},\n\n"
                f"Thank you for applying to list your store \"{seller.store_name}\" "
                f"on the Nyakizu Digital Market.\n\n"
                f"After careful review, we regret to inform you that your application "
                f"has not been approved at this time.\n\n"
            )
            if reason:
                message += (
                    f"Reason:\n{reason}\n\n"
                )
            message += (
                f"You are welcome to update your information and resubmit your "
                f"application for review.\n\n"
                f"If you have any questions, please reach out to our support team.\n\n"
                f"Best regards,\n"
                f"The Nyakizu Team"
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                recipient_list=[seller.user.email],
                fail_silently=True,
            )
        except Exception:
            import traceback
            traceback.print_exc()

        return Response({"message": f"{seller.store_name} has been rejected."})


# ── Buyer profile views ───────────────────────────────────────────────────────

class BuyerProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BuyerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if is_admin_user(self.request.user):
            return BuyerProfile.objects.all()
        return BuyerProfile.objects.filter(user=self.request.user)



# ── Buyer store following ─────────────────────────────────────────────────────

class FollowStoreView(APIView):
    """
    POST /api/accounts/sellers/<id>/follow/

    Buyer follows a wholesaler store.
    No approval required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != "buyer":
            return Response(
                {"error": "Only buyers can follow stores."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            seller = SellerProfile.objects.get(
                pk=pk,
                approval_status="approved",
            )
        except SellerProfile.DoesNotExist:
            return Response(
                {"error": "Store not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        follow, created = BuyerStoreFollow.objects.get_or_create(
            buyer=request.user,
            seller=seller,
        )

        if not created:
            return Response(
                {"message": "You are already following this store."},
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "message": f"You are now following {seller.store_name}.",
                "follow": BuyerStoreFollowSerializer(follow).data,
            },
            status=status.HTTP_201_CREATED,
        )


class FollowedStoresView(generics.ListAPIView):
    """
    GET /api/accounts/followed-stores/

    Returns stores followed by the logged-in buyer.
    """
    serializer_class = BuyerStoreFollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BuyerStoreFollow.objects.filter(
            buyer=self.request.user
        ).select_related("seller")


class RequestSellerAccessView(APIView):
    """
    POST /api/accounts/sellers/<pk>/request-access/

    Path-addressed equivalent of POSTing to /api/accounts/relationships/
    with { seller_id: pk } in the body — same effect, for callers that
    already have the seller in the URL (mirrors FollowStoreView's shape).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not is_verified_buyer(request.user):
            return Response(
                {"error": "Only verified buyers can request supplier access."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            seller = SellerProfile.objects.get(pk=pk, approval_status="approved")
        except SellerProfile.DoesNotExist:
            return Response({"error": "Store not found."}, status=status.HTTP_404_NOT_FOUND)

        relationship, created = BuyerSellerRelationship.objects.get_or_create(
            buyer=request.user, seller=seller
        )
        return Response(
            BuyerSellerRelationshipSerializer(relationship).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class RelationshipListCreateView(APIView):
    """
    GET  /api/accounts/relationships/ and /api/accounts/relationships/mine/
         Role-aware: a buyer sees their own requests to sellers; an approved
         seller sees the requests buyers have made to their store.
    POST /api/accounts/relationships/
         A verified buyer requests trusted access to a seller's store.
         Body: { seller_id }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if is_verified_buyer(request.user):
            qs = BuyerSellerRelationship.objects.filter(buyer=request.user)
        elif is_approved_seller(request.user):
            qs = BuyerSellerRelationship.objects.filter(seller=request.user.seller_profile)
        else:
            qs = BuyerSellerRelationship.objects.none()

        serializer = BuyerSellerRelationshipSerializer(
            qs.select_related("buyer", "seller"), many=True
        )
        return Response(serializer.data)

    def post(self, request):
        if not is_verified_buyer(request.user):
            return Response(
                {"error": "Only verified buyers can request supplier access."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            seller = SellerProfile.objects.get(
                pk=request.data.get("seller_id"), approval_status="approved"
            )
        except (SellerProfile.DoesNotExist, TypeError, ValueError):
            return Response({"error": "Store not found."}, status=status.HTTP_404_NOT_FOUND)

        relationship, created = BuyerSellerRelationship.objects.get_or_create(
            buyer=request.user, seller=seller
        )
        return Response(
            BuyerSellerRelationshipSerializer(relationship).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class RelationshipResolveView(APIView):
    """
    POST /api/accounts/relationships/<id>/resolve/
    The seller who owns the request approves or denies it. Body: { action: "approve"|"deny" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not is_approved_seller(request.user):
            return Response(
                {"error": "Only approved sellers can resolve buyer requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            relationship = BuyerSellerRelationship.objects.get(
                pk=pk, seller=request.user.seller_profile
            )
        except BuyerSellerRelationship.DoesNotExist:
            return Response({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")
        if action == "approve":
            relationship.approve()
        elif action == "deny":
            relationship.deny()
        else:
            return Response(
                {"error": "action must be 'approve' or 'deny'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(BuyerSellerRelationshipSerializer(relationship).data)


class CommunityActivityView(APIView):
    """
    Public homepage endpoint: aggregate community stats + recently
    joined members. No auth required — this powers marketing content
    on the landing page.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        members_qs = CustomUser.objects.filter(role__in=['buyer', 'seller'], is_staff=False, is_superuser=False)

        stats = {
            'members': members_qs.count(),
            'stores': SellerProfile.objects.filter(approval_status='approved').count(),
            'products': Product.objects.filter(status='available').count(),
            'cities': self._city_count(),
        }

        recent = (
            members_qs
            .select_related('buyer_profile', 'seller_profile')
            .order_by('-date_joined')[:6]
        )
        recent_members = [self._serialize_member(u) for u in recent]

        serializer = CommunityActivitySerializer(
            {'stats': stats, 'recent_members': recent_members}
        )
        return Response(serializer.data)

    def _city_count(self):
        buyer_locations = BuyerProfile.objects.exclude(location='').values_list('location', flat=True)
        seller_locations = SellerProfile.objects.exclude(location='').values_list('location', flat=True)
        return len(set(buyer_locations) | set(seller_locations))

    def _serialize_member(self, user):
        location = ''
        verified = False

        if user.role == 'seller' and hasattr(user, 'seller_profile'):
            location = user.seller_profile.location
            verified = user.seller_profile.is_live
        elif user.role == 'buyer' and hasattr(user, 'buyer_profile'):
            location = user.buyer_profile.location

        return {
            'id': user.id,
            'name': user.get_full_name() or user.username,
            'role': 'Seller' if user.role == 'seller' else 'Buyer',
            'verified': verified,
            'location': location or 'Not specified',
            'joined': user.date_joined.date().isoformat(),
            'avatar': None,
        }
