from django.conf import settings
from django.db import models


class Expense(models.Model):
    class Category(models.TextChoices):
        MAINTENANCE = "MAINTENANCE", "Maintenance"
        ELECTRICITY = "ELECTRICITY", "Electricity"
        WATER = "WATER", "Water"
        SECURITY = "SECURITY", "Security"
        CLEANING = "CLEANING", "Cleaning"
        REPAIR = "REPAIR", "Repair"
        OTHER = "OTHER", "Other"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    expense_date = models.DateField()

    vendor_name = models.CharField(
        max_length=150,
        blank=True,
    )

    invoice_number = models.CharField(
        max_length=100,
        blank=True,
    )

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="recorded_expenses",
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-expense_date", "-created_at"]

    def __str__(self):
        return f"{self.title} - ₹{self.amount}"