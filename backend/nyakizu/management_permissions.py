from rest_framework.permissions import BasePermission


class IsMainAdmin(BasePermission):
    """Management access is limited to active platform administrators."""

    message = "Company management is restricted to administrators."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and (user.is_staff or user.is_superuser or user.role == "admin"))

