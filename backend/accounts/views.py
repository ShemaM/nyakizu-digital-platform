"""
accounts/views.py

API views for user registration and seller profiles.

We use DRF's generic views (generics.CreateAPIView etc.) which
handle the common CRUD patterns so we don't have to write
boilerplate code for each operation.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from .models import CustomUser, SellerProfile
from .serializers import RegisterSerializer, UserSerializer, SellerProfileSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/accounts/register/
    Create a new user account.
    Anyone can access this endpoint (no login required).
    """
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    """
    POST /api/accounts/login/
    Log in with username + password.
    Returns user info on success.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # authenticate() checks username/password and returns the user or None
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)   # create a session
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    """
    POST /api/accounts/logout/
    Log out the current user (destroys the session).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """
    GET /api/accounts/me/
    Return the currently logged-in user's details.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class SellerProfileListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/accounts/sellers/       — list all verified seller profiles
    POST /api/accounts/sellers/       — create a seller profile for the current user
    """
    serializer_class = SellerProfileSerializer

    def get_queryset(self):
        return SellerProfile.objects.filter(is_verified=True)

    def perform_create(self, serializer):
        # Automatically link the profile to the logged-in user
        serializer.save(user=self.request.user)


class SellerProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/accounts/sellers/<id>/  — view a single seller profile
    PUT   /api/accounts/sellers/<id>/  — update a seller profile
    PATCH /api/accounts/sellers/<id>/  — partial update
    """
    queryset = SellerProfile.objects.all()
    serializer_class = SellerProfileSerializer

    def get_permissions(self):
        # Anyone can view, but only authenticated users can update
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
