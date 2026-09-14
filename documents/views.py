from rest_framework import viewsets
from accounts.permissions import ReadOnlyOrCommittee
from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by("-created_at")
    serializer_class = DocumentSerializer
    permission_classes = [ReadOnlyOrCommittee]

    def perform_create(self, serializer):
        extra = {}
        if not serializer.validated_data.get("uploaded_by") and self.request.user.is_authenticated:
            extra["uploaded_by"] = self.request.user
        serializer.save(**extra)
