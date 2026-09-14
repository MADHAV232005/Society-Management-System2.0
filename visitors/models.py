from django.conf import settings
from django.db import models
from society.models import Flat


class Visitor(models.Model):
    class VisitType(models.TextChoices):
        GUEST = "GUEST", "Guest"
        DELIVERY = "DELIVERY", "Delivery"
        SERVICE = "SERVICE", "Service"
        CAB = "CAB", "Cab"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        EXPECTED = "EXPECTED", "Expected"
        CHECKED_IN = "CHECKED_IN", "Checked In"
        CHECKED_OUT = "CHECKED_OUT", "Checked Out"
        CANCELLED = "CANCELLED", "Cancelled"

    visitor_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15, blank=True)

    flat = models.ForeignKey(
        Flat,
        on_delete=models.PROTECT,
        related_name="visitors",
    )

    visit_type = models.CharField(
        max_length=20,
        choices=VisitType.choices,
        default=VisitType.GUEST,
    )

    purpose = models.CharField(max_length=255, blank=True)

    vehicle_number = models.CharField(
        max_length=20,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.EXPECTED,
    )

    checked_in_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    checked_out_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="registered_visitors",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.visitor_name} - {self.flat}"