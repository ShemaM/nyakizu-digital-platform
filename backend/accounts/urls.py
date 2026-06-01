"""
accounts/urls.py

URL patterns for the accounts app.
All paths here are relative to /api/accounts/ (set in the root urls.py).
"""

from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    SellerProfileListCreateView,
    SellerProfileDetailView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('sellers/', SellerProfileListCreateView.as_view(), name='sellers-list'),
    path('sellers/<int:pk>/', SellerProfileDetailView.as_view(), name='seller-detail'),
]
