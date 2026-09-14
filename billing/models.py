from decimal import Decimal

from django.db import models

from society.models import Flat


class MaintenanceBill(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PARTIAL = "PARTIAL", "Partially Paid"
        PAID = "PAID", "Paid"
        OVERDUE = "OVERDUE", "Overdue"

    flat = models.ForeignKey(
        Flat,
        on_delete=models.PROTECT,
        related_name="maintenance_bills",
    )

    billing_month = models.DateField()
    due_date = models.DateField()

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["flat", "billing_month"],
                name="unique_bill_per_flat_month",
            )
        ]
        ordering = ["-billing_month"]

    def __str__(self):
        return f"{self.flat} - {self.billing_month:%B %Y}"

    @property
    def total_paid(self):
        return sum(
            (payment.amount for payment in self.payments.all()),
            Decimal("0.00"),
        )

    @property
    def pending_amount(self):
        pending = self.amount - self.total_paid
        return max(pending, Decimal("0.00"))


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = "CASH", "Cash"
        UPI = "UPI", "UPI"
        BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"
        CARD = "CARD", "Card"
        CHEQUE = "CHEQUE", "Cheque"

    bill = models.ForeignKey(
        MaintenanceBill,
        on_delete=models.PROTECT,
        related_name="payments",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    payment_date = models.DateField()
    payment_method = models.CharField(
        max_length=20,
        choices=Method.choices,
    )

    transaction_reference = models.CharField(
        max_length=100,
        blank=True,
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment ₹{self.amount} - {self.bill}"


class Receipt(models.Model):
    payment = models.OneToOneField(
        Payment,
        on_delete=models.PROTECT,
        related_name="receipt",
    )

    receipt_number = models.CharField(
        max_length=50,
        unique=True,
    )

    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.receipt_number