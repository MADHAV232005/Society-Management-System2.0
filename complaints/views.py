from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from accounts.models import User
from accounts.permissions import ComplaintPermission
from .models import Complaint, ComplaintStatusHistory
from .serializers import (
    ComplaintSerializer,
    ComplaintStatusHistorySerializer,
)


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [ComplaintPermission]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Complaint.objects.none()
        if user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE] or user.is_superuser:
            return Complaint.objects.all().order_by("-created_at")
        if user.role == User.Role.RESIDENT:
            return Complaint.objects.filter(resident=user).order_by("-created_at")
        return Complaint.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        extra = {}
        if user.role == User.Role.RESIDENT:
            extra["resident"] = user
            if hasattr(user, "resident_profile") and user.resident_profile:
                extra["flat"] = user.resident_profile.flat
            extra["status"] = Complaint.Status.OPEN
        else:
            if not serializer.validated_data.get("resident"):
                extra["resident"] = user
            if not serializer.validated_data.get("flat") and hasattr(user, "resident_profile") and user.resident_profile:
                extra["flat"] = user.resident_profile.flat
        instance = serializer.save(**extra)
        ComplaintStatusHistory.objects.create(
            complaint=instance,
            old_status="",
            new_status=instance.status,
            changed_by=user,
            remarks="Complaint lodged",
        )

    def perform_update(self, serializer):
        user = self.request.user
        old_status = serializer.instance.status
        if user.role == User.Role.RESIDENT:
            new_status = serializer.validated_data.get("status", old_status)
            if new_status in [Complaint.Status.RESOLVED, Complaint.Status.REJECTED]:
                raise PermissionDenied(
                    "Residents cannot resolve or reject complaints. Only committee members can update status."
                )
            # Residents cannot reassign complaints
            if "assigned_to" in serializer.validated_data and serializer.validated_data["assigned_to"] != serializer.instance.assigned_to:
                raise PermissionDenied("Residents cannot assign staff to complaints.")
            # Ensure resident owns this complaint
            if serializer.instance.resident != user:
                raise PermissionDenied("You cannot modify another resident's complaint.")
        instance = serializer.save()
        if old_status != instance.status:
            ComplaintStatusHistory.objects.create(
                complaint=instance,
                old_status=old_status,
                new_status=instance.status,
                changed_by=user,
                remarks=self.request.data.get("remarks", f"Status updated to {instance.status}"),
            )


class ComplaintStatusHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ComplaintStatusHistorySerializer
    permission_classes = [ComplaintPermission]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return ComplaintStatusHistory.objects.none()
        if user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE] or user.is_superuser:
            return ComplaintStatusHistory.objects.all().order_by("-changed_at")
        if user.role == User.Role.RESIDENT:
            return ComplaintStatusHistory.objects.filter(complaint__resident=user).order_by("-changed_at")
        return ComplaintStatusHistory.objects.none()
