"""
accounts/views.py

API views for user registration, login, and profiles.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from .models import CustomUser, BuyerProfile, SellerProfile
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    BuyerProfileSerializer,
    SellerProfileSerializer,
)


class RegisterView(APIView):
    """
    POST /api/accounts/register/
    Create a new user + profile in one call.

    Accepts all three registration wizard steps merged into one JSON body:
      Buyer:  { full_name, phone, password, role, location, main_supplier, business_type }
      Seller: { full_name, phone, password, role, shop_name, shop_location, categories[] }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Log the user in immediately after registration
            login(request, user)
            output = UserSerializer(user)
            return Response(output.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/accounts/login/
    Accepts { phone, password } or { username, password }.

    Since the frontend collects a phone number (not a username) during
    registration, users can log in with their phone number.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('phone') or request.data.get('username', '')
        password = request.data.get('password', '')

        # Try looking up by phone number first, then fall back to username
        user_obj = None
        if identifier:
            user_obj = CustomUser.objects.filter(phone_number=identifier).first()
            if not user_obj:
                user_obj = CustomUser.objects.filter(username=identifier).first()

        if user_obj and user_obj.check_password(password):
            login(request, user_obj)
            return Response(UserSerializer(user_obj).data, status=status.HTTP_200_OK)

        return Response(
            {'error': 'Invalid phone number or password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class LogoutView(APIView):
    """POST /api/accounts/logout/ — destroys the session."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully.'})


class CurrentUserView(APIView):
    """GET /api/accounts/me/ — return the currently logged-in user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class SellerProfileListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/accounts/sellers/  — list verified sellers (public)
    POST /api/accounts/sellers/  — create a seller profile
    """
    serializer_class = SellerProfileSerializer

    def get_queryset(self):
        return SellerProfile.objects.filter(is_verified=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SellerProfileDetailView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/accounts/sellers/<id>/"""
    queryset = SellerProfile.objects.all()
    serializer_class = SellerProfileSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class BuyerProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT/PATCH /api/accounts/buyers/<id>/
    View or update a buyer's profile.
    """
    queryset = BuyerProfile.objects.all()
    serializer_class = BuyerProfileSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
