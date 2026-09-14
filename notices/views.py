from rest_framework import viewsets
from accounts.permissions import ReadOnlyOrCommittee
from .models import Notice
from .serializers import NoticeSerializer


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().order_by("-created_at")
    serializer_class = NoticeSerializer
    permission_classes = [ReadOnlyOrCommittee]

    def perform_create(self, serializer):
        extra = {}
        if not serializer.validated_data.get("published_by") and self.request.user.is_authenticated:
            extra["published_by"] = self.request.user
        serializer.save(**extra)
