from django.conf import settings
from django.db.models import Q
from django.core.mail import send_mail
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout

from .models import CustomUser, BuyerProfile, SellerProfile, BuyerSellerRelationship
from .permissions import is_admin_user, is_verified_buyer
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    BuyerProfileSerializer,
    SellerProfileSerializer,
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
                    f"api/accounts/verify-email/?token={token}"
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

            data = UserSerializer(user).data
            if settings.DEBUG:
                data["verification_token"] = token
            return Response(data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



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

        if not user_obj.is_email_verified:
            return Response(
                {"error": "Please verify your email before signing in."},
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user_obj)
        return Response(UserSerializer(user_obj).data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out."})


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ── Seller store views ────────────────────────────────────────────────────────

class SellerProfileListView(generics.ListAPIView):
    """
    GET /api/accounts/sellers/
    Lists only approved (live) stores. Public.
    """
    serializer_class   = SellerProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return SellerProfile.objects.filter(approval_status="approved")


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


class ApproveSellerView(APIView):
    """
    POST /api/accounts/sellers/<id>/approve/
    Admin only. Marks the store as approved.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            seller = SellerProfile.objects.get(pk=pk)
        except SellerProfile.DoesNotExist:
            return Response({"error": "Store not found."}, status=404)

        seller.approve()
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

        seller.reject(note=request.data.get("note", ""))
        return Response({"message": f"{seller.store_name} has been rejected."})


# ── Buyer profile views ───────────────────────────────────────────────────────

class BuyerProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BuyerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if is_admin_user(self.request.user):
            return BuyerProfile.objects.all()
        return BuyerProfile.objects.filter(user=self.request.user)


# ── Buyer ↔ Seller relationship ───────────────────────────────────────────────

class RequestStoreAccessView(APIView):
    """
    POST /api/accounts/sellers/<id>/request-access/
    A buyer requests access to a specific seller's store.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not is_verified_buyer(request.user):
            return Response(
                {"error": "Only verified buyers can request store access."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            seller = SellerProfile.objects.get(pk=pk, approval_status="approved")
        except SellerProfile.DoesNotExist:
            return Response({"error": "Store not found."}, status=404)

        if seller.user == request.user:
            return Response(
                {"error": "You cannot request access to your own store."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = BuyerSellerRelationship.objects.get_or_create(
            buyer=request.user,
            seller=seller,
        )
        if not created:
            return Response(
                {"error": "You have already requested access to this store."},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {"message": f"Access requested. {seller.store_name} will be notified."},
            status=status.HTTP_201_CREATED,
        )


class ResolveBuyerAccessView(APIView):
    """
    POST /api/accounts/relationships/<id>/approve/
    POST /api/accounts/relationships/<id>/deny/
    Seller approves or denies a buyer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, action):
        if action not in {"approve", "deny"}:
            return Response({"error": "Unknown action."}, status=400)

        try:
            rel = BuyerSellerRelationship.objects.get(
                pk=pk,
                seller__user=request.user,
            )
        except BuyerSellerRelationship.DoesNotExist:
            return Response({"error": "Relationship not found."}, status=404)

        if action == "approve":
            rel.approve()
            return Response({"message": "Buyer approved."})

        rel.deny(note=request.data.get("note", ""))
        return Response({"message": "Buyer denied."})
