from django.urls import path
from .views import (
    RegisterView,
    VerifyEmailView,
    LoginView,
    LogoutView,
    CurrentUserView,
    UserListView,
    SellerProfileListView,
    SellerProfileDetailView,
    PendingSellerListView,
    ApproveSellerView,
    RejectSellerView,
    BuyerProfileDetailView,
    CommunityActivityView,
    FollowStoreView,
    FollowedStoresView,
)

urlpatterns = [
    # Auth
    path("register/",    RegisterView.as_view(),    name="register"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("login/",       LoginView.as_view(),       name="login"),
    path("logout/",      LogoutView.as_view(),      name="logout"),
    path("me/",          CurrentUserView.as_view(), name="current-user"),
    path("users/",       UserListView.as_view(),    name="user-list"),

    # Seller stores
    path("sellers/",                          SellerProfileListView.as_view(),   name="sellers-list"),
    path("sellers/pending/",                   PendingSellerListView.as_view(),   name="sellers-pending"),
    path("sellers/<int:pk>/",                  SellerProfileDetailView.as_view(), name="seller-detail"),
    path("sellers/<int:pk>/approve/",            ApproveSellerView.as_view(),       name="seller-approve"),
    path("sellers/<int:pk>/reject/",            RejectSellerView.as_view(),        name="seller-reject"),

    # Buyer store following
    path("sellers/<int:pk>/follow/", FollowStoreView.as_view(), name="follow-store"),
    path("followed-stores/", FollowedStoresView.as_view(), name="followed-stores"),

    # Buyer profile
    path("buyers/<int:pk>/", BuyerProfileDetailView.as_view(), name="buyer-detail"),

    # Homepage community feed
    path("community/", CommunityActivityView.as_view(), name="community-activity"),
]
