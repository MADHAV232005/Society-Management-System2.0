from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from accounts.models import User
from accounts.permissions import VisitorPermission
from .models import Visitor
from .serializers import VisitorSerializer


class VisitorViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorSerializer
    permission_classes = [VisitorPermission]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Visitor.objects.none()
        if (
            user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE, User.Role.SECURITY]
            or user.is_superuser
        ):
            return Visitor.objects.all().order_by("-created_at")
        if hasattr(user, "resident_profile") and user.resident_profile:
            return Visitor.objects.filter(flat=user.resident_profile.flat).order_by("-created_at")
        return Visitor.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        extra = {}
        if not serializer.validated_data.get("registered_by"):
            extra["registered_by"] = user
        if user.role == User.Role.RESIDENT:
            if not hasattr(user, "resident_profile") or not user.resident_profile:
                raise PermissionDenied("Resident profile required to register visitors.")
            req_flat = serializer.validated_data.get("flat")
            if req_flat and req_flat != user.resident_profile.flat:
                raise PermissionDenied("Residents can only register visitors for their own flat.")
            extra["flat"] = user.resident_profile.flat
        elif (
            not serializer.validated_data.get("flat")
            and hasattr(user, "resident_profile")
            and user.resident_profile
        ):
            extra["flat"] = user.resident_profile.flat
        status = serializer.validated_data.get("status", Visitor.Status.EXPECTED)
        if status == Visitor.Status.CHECKED_IN and not serializer.validated_data.get("checked_in_at"):
            extra["checked_in_at"] = timezone.now()
        serializer.save(**extra)

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        new_status = serializer.validated_data.get("status", old_status)
        extra = {}
        if new_status == Visitor.Status.CHECKED_IN and not serializer.instance.checked_in_at:
            extra["checked_in_at"] = timezone.now()
        elif new_status == Visitor.Status.CHECKED_OUT and not serializer.instance.checked_out_at:
            extra["checked_out_at"] = timezone.now()
        serializer.save(**extra)

