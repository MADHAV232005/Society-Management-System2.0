from rest_framework import viewsets
from accounts.permissions import ReadOnlyOrCommittee
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by("-expense_date")
    serializer_class = ExpenseSerializer
    permission_classes = [ReadOnlyOrCommittee]

    def perform_create(self, serializer):
        extra = {}
        if not serializer.validated_data.get("recorded_by") and self.request.user.is_authenticated:
            extra["recorded_by"] = self.request.user
        serializer.save(**extra)
