"""
accounts/adapters.py

Custom allauth adapters so Google Sign-In users land in our
CustomUser model with a sensible default role.

How it works:
  1. User clicks "Continue with Google" on the frontend.
  2. allauth handles the OAuth dance with Google.
  3. allauth calls our adapter to create or look up the local user.
  4. We ensure the user has role='buyer' by default (they can upgrade
     to seller later through the regular seller onboarding flow).
"""

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter


class AccountAdapter(DefaultAccountAdapter):
    """Customises how allauth creates local (username/password) accounts."""

    def save_user(self, request, user, form, commit=True):
        """Set role='buyer' as the default for any new registration."""
        user = super().save_user(request, user, form, commit=False)
        if not user.role:
            user.role = 'buyer'
        if commit:
            user.save()
        return user


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    """Customises how allauth handles social (Google) logins."""

    def save_user(self, request, sociallogin, form=None):
        """
        Called when a brand-new user signs in with Google.

        Beyond the default save we must make the account equivalent to a
        normal buyer signup, or the user ends up signed in but unusable:
        - is_email_verified: Google has already verified the address, and
          is_verified_buyer() blocks ordering without this flag. (Our own
          verification email flow never runs for social signups.)
        - BuyerProfile: normally created by RegisterSerializer, which social
          signups bypass entirely.
        """
        from .models import BuyerProfile
        from .notifications import notify_admins_new_signup

        user = super().save_user(request, sociallogin, form)

        update_fields = []
        if not user.role:
            user.role = 'buyer'
            update_fields.append('role')
        if not user.is_email_verified:
            user.is_email_verified = True
            update_fields.append('is_email_verified')
        if update_fields:
            user.save(update_fields=update_fields)

        BuyerProfile.objects.get_or_create(user=user)

        # Regular-form signups notify admins from RegisterView — this is
        # the equivalent hook for the Google sign-up path, which bypasses
        # RegisterView entirely.
        notify_admins_new_signup(user, request)

        return user

    def populate_user(self, request, sociallogin, data):
        """
        Map Google profile data to our CustomUser fields.
        'data' comes from Google's userinfo endpoint.
        """
        user = super().populate_user(request, sociallogin, data)
        # Google gives us first_name and last_name separately
        user.first_name = data.get('first_name', '')
        user.last_name = data.get('last_name', '')
        return user
