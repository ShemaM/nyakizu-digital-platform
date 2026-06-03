from django.urls import path
from .views import (
    RegisterView,
    VerifyEmailView,
    LoginView,
    LogoutView,
    CurrentUserView,
    SellerProfileListView,
    SellerProfileDetailView,
    ApproveSellerView,
    RejectSellerView,
    BuyerProfileDetailView,
    RequestStoreAccessView,
    ResolveBuyerAccessView,
)

urlpatterns = [
    # Auth
    path("register/",    RegisterView.as_view(),    name="register"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("login/",       LoginView.as_view(),       name="login"),
    path("logout/",      LogoutView.as_view(),      name="logout"),
    path("me/",          CurrentUserView.as_view(), name="current-user"),

    # Seller stores
    path("sellers/",                          SellerProfileListView.as_view(),   name="sellers-list"),
    path("sellers/<int:pk>/",                 SellerProfileDetailView.as_view(), name="seller-detail"),
    path("sellers/<int:pk>/approve/",         ApproveSellerView.as_view(),       name="seller-approve"),
    path("sellers/<int:pk>/reject/",          RejectSellerView.as_view(),        name="seller-reject"),
    path("sellers/<int:pk>/request-access/",  RequestStoreAccessView.as_view(),  name="request-access"),

    # Buyer–seller relationships
    path("relationships/<int:pk>/<str:action>/", ResolveBuyerAccessView.as_view(), name="resolve-access"),

    # Buyer profile
    path("buyers/<int:pk>/", BuyerProfileDetailView.as_view(), name="buyer-detail"),
]
