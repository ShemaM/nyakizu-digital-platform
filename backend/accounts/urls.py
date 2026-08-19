from django.urls import path
from .views import (
    RegisterView,
    VerifyEmailView,
    ResendVerificationEmailView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
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
    RequestSellerAccessView,
    RelationshipListCreateView,
    RelationshipResolveView,
    PushSubscribeView,
    PushUnsubscribeView,
)

urlpatterns = [
    # Auth
    path("register/",    RegisterView.as_view(),    name="register"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationEmailView.as_view(), name="resend-verification"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
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
    path("sellers/<int:pk>/request-access/", RequestSellerAccessView.as_view(), name="seller-request-access"),
    path("followed-stores/", FollowedStoresView.as_view(), name="followed-stores"),

    # Buyer profile
    path("buyers/<int:pk>/", BuyerProfileDetailView.as_view(), name="buyer-detail"),

    # Trusted-supplier relationships (buyer <-> seller approval)
    path("relationships/", RelationshipListCreateView.as_view(), name="relationships-list-create"),
    path("relationships/mine/", RelationshipListCreateView.as_view(), name="relationships-mine"),
    path("relationships/<int:pk>/resolve/", RelationshipResolveView.as_view(), name="relationship-resolve"),

    # Homepage community feed
    path("community/", CommunityActivityView.as_view(), name="community-activity"),

    # Web Push
    path("push-subscribe/",   PushSubscribeView.as_view(),   name="push-subscribe"),
    path("push-unsubscribe/", PushUnsubscribeView.as_view(), name="push-unsubscribe"),
]
