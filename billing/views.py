from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from accounts.models import User
from accounts.permissions import (
    MaintenanceBillPermission,
    PaymentPermission,
    ReceiptPermission,
)
from .models import MaintenanceBill, Payment, Receipt
from .serializers import (
    MaintenanceBillSerializer,
    PaymentSerializer,
    ReceiptSerializer,
)


class MaintenanceBillViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceBillSerializer
    permission_classes = [MaintenanceBillPermission]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return MaintenanceBill.objects.none()
        if user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE] or user.is_superuser:
            return MaintenanceBill.objects.all().order_by("-billing_month", "flat__flat_number")
        if hasattr(user, "resident_profile") and user.resident_profile:
            return MaintenanceBill.objects.filter(flat=user.resident_profile.flat).order_by("-billing_month")
        return MaintenanceBill.objects.none()


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [PaymentPermission]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Payment.objects.none()
        if user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE] or user.is_superuser:
            return Payment.objects.all().order_by("-payment_date")
        if hasattr(user, "resident_profile") and user.resident_profile:
            return Payment.objects.filter(bill__flat=user.resident_profile.flat).order_by("-payment_date")
        return Payment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        bill = serializer.validated_data.get("bill")
        if user.role == User.Role.RESIDENT:
            if (
                not hasattr(user, "resident_profile")
                or not user.resident_profile
                or not bill
                or bill.flat != user.resident_profile.flat
            ):
                raise PermissionDenied("You can only make payments for your own flat's bills.")
        payment = serializer.save()
        receipt_no = f"RCP-{payment.id:04d}-{payment.payment_date.strftime('%Y%m%d')}"
        Receipt.objects.get_or_create(payment=payment, defaults={"receipt_number": receipt_no})
        bill = payment.bill
        total_paid = bill.total_paid
        if total_paid >= bill.amount:
            bill.status = MaintenanceBill.Status.PAID
        elif total_paid > 0:
            bill.status = MaintenanceBill.Status.PARTIAL
        bill.save()


class ReceiptViewSet(viewsets.ModelViewSet):
    serializer_class = ReceiptSerializer
    permission_classes = [ReceiptPermission]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Receipt.objects.none()
        if user.role in [User.Role.SUPER_ADMIN, User.Role.COMMITTEE] or user.is_superuser:
            return Receipt.objects.all().order_by("-issued_at")
        if hasattr(user, "resident_profile") and user.resident_profile:
            return Receipt.objects.filter(payment__bill__flat=user.resident_profile.flat).order_by("-issued_at")
        return Receipt.objects.none()
