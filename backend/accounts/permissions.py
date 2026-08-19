from rest_framework import permissions


def is_admin_user(user):
    """Staff users act as platform admins for API-level moderation flows."""
    return bool(user and user.is_authenticated and user.is_staff)


def is_verified_buyer(user):
    """Only verified buyers should create trusted-supplier relationships and orders."""
    return bool(
        user
        and user.is_authenticated
        and user.role == "buyer"
        and user.is_email_verified
    )


def is_approved_seller(user):
    """A seller can publish products only after admin approval of their store."""
    if not user or not user.is_authenticated or user.role != "seller":
        return False

    try:
        return user.seller_profile.approval_status == "approved"
    except Exception:
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """Read access is public; writes are reserved for platform admins."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin_user(request.user)


class IsAdminOrApprovedSellerCanCreate(permissions.BasePermission):
    """
    Read access is public. Creating a new category is open to admins and
    approved sellers — this is how a seller adds a custom category for
    products outside the existing taxonomy (e.g. a phone accessories seller
    who starts stocking laptops). Editing or deleting an existing category
    stays admin-only, so one seller can't rename or remove a category other
    sellers already depend on.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == "POST":
            return is_admin_user(request.user) or is_approved_seller(request.user)
        return is_admin_user(request.user)


class IsApprovedSeller(permissions.BasePermission):
    """Require a seller account whose store has passed admin approval."""

    def has_permission(self, request, view):
        return is_approved_seller(request.user)
