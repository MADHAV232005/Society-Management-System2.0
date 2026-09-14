from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import User


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == User.Role.SUPER_ADMIN or request.user.is_superuser)
        )


class IsCommitteeOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE]
                or request.user.is_superuser
            )
        )


class IsSecurityOrStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role
                in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE, User.Role.SECURITY]
                or request.user.is_superuser
            )
        )


class IsResidentUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == User.Role.RESIDENT)
        )


class ReadOnlyOrCommittee(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE]
            or request.user.is_superuser
        )


class MaintenanceBillPermission(BasePermission):
    """
    SUPER_ADMIN and COMMITTEE: full CRUD.
    RESIDENT: read only (SAFE_METHODS).
    SECURITY: no access.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser or user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE]:
            return True
        if user.role == User.Role.RESIDENT and request.method in SAFE_METHODS:
            return True
        return False


class PaymentPermission(BasePermission):
    """
    SUPER_ADMIN and COMMITTEE: full management (CRUD).
    RESIDENT: view own payment history (SAFE_METHODS) and create payments (POST).
    SECURITY: no payment management.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser or user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE]:
            return True
        if user.role == User.Role.RESIDENT and request.method in (*SAFE_METHODS, "POST"):
            return True
        return False


class ReceiptPermission(BasePermission):
    """
    SUPER_ADMIN and COMMITTEE: full management.
    RESIDENT: read only for their own flat (SAFE_METHODS).
    SECURITY: no access.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser or user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE]:
            return True
        if user.role == User.Role.RESIDENT and request.method in SAFE_METHODS:
            return True
        return False


class ComplaintPermission(BasePermission):
    """
    COMMITTEE & SUPER_ADMIN: view, assign, update status and manage complaints (full CRUD).
    RESIDENT: create complaints and view/update their own complaints (cannot delete).
    SECURITY: no complaint management.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser or user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE]:
            return True
        if user.role == User.Role.RESIDENT:
            if request.method in (*SAFE_METHODS, "POST", "PUT", "PATCH"):
                return True
        return False


class VisitorPermission(BasePermission):
    """
    SECURITY, COMMITTEE, SUPER_ADMIN: full visitor management.
    RESIDENT: view and create visitors only for their own flat (SAFE_METHODS + POST).
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser or user.role in [
            User.Role.SUPER_ADMIN,
            User.Role.COMMITTEE,
            User.Role.SECURITY,
        ]:
            return True
        if user.role == User.Role.RESIDENT and request.method in (*SAFE_METHODS, "POST"):
            return True
        return False
