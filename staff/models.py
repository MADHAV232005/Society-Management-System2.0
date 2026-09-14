from django.conf import settings
from django.db import models


class Staff(models.Model):
    class StaffType(models.TextChoices):
        SECURITY = "SECURITY", "Security"
        CLEANING = "CLEANING", "Cleaning"
        MAINTENANCE = "MAINTENANCE", "Maintenance"
        GARDENER = "GARDENER", "Gardener"
        OTHER = "OTHER", "Other"

    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    staff_type = models.CharField(
        max_length=20,
        choices=StaffType.choices,
        default=StaffType.OTHER,
    )
    address = models.TextField(blank=True)
    joining_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name