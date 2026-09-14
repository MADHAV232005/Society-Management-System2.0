from rest_framework import viewsets
from accounts.permissions import ReadOnlyOrCommittee
from .models import Staff
from .serializers import StaffSerializer


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [ReadOnlyOrCommittee]
