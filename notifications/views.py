from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from accounts.models import User
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Notification.objects.none()
        return Notification.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        extra = {}
        if not (user.is_superuser or user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE]):
            req_user = serializer.validated_data.get("user")
            if req_user and req_user != user:
                raise PermissionDenied("You cannot create notifications for another user.")
            extra["user"] = user
        else:
            if not serializer.validated_data.get("user"):
                extra["user"] = user
        serializer.save(**extra)

    def perform_update(self, serializer):
        user = self.request.user
        if not (user.is_superuser or user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE]):
            if serializer.instance.user != user:
                raise PermissionDenied("You cannot modify another user's notifications.")
            if "user" in serializer.validated_data and serializer.validated_data["user"] != user:
                raise PermissionDenied("You cannot reassign notifications to another user.")
        serializer.save()
