from rest_framework import viewsets
from accounts.permissions import ReadOnlyOrCommittee
from .models import Society, Wing, Flat, Resident
from .serializers import (
    SocietySerializer,
    WingSerializer,
    FlatSerializer,
    ResidentSerializer,
)


class SocietyViewSet(viewsets.ModelViewSet):
    queryset = Society.objects.all()
    serializer_class = SocietySerializer
    permission_classes = [ReadOnlyOrCommittee]


class WingViewSet(viewsets.ModelViewSet):
    queryset = Wing.objects.all()
    serializer_class = WingSerializer
    permission_classes = [ReadOnlyOrCommittee]


class FlatViewSet(viewsets.ModelViewSet):
    queryset = Flat.objects.all()
    serializer_class = FlatSerializer
    permission_classes = [ReadOnlyOrCommittee]


class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    permission_classes = [ReadOnlyOrCommittee]
