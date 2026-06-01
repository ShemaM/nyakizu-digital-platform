"""
accounts/urls.py — all paths relative to /api/accounts/
"""

from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    SellerProfileListCreateView,
    SellerProfileDetailView,
    BuyerProfileDetailView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('sellers/', SellerProfileListCreateView.as_view(), name='sellers-list'),
    path('sellers/<int:pk>/', SellerProfileDetailView.as_view(), name='seller-detail'),
    path('buyers/<int:pk>/', BuyerProfileDetailView.as_view(), name='buyer-detail'),
]
