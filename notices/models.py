from django.conf import settings
from django.db import models


class Notice(models.Model):
    class NoticeType(models.TextChoices):
        GENERAL = "GENERAL", "General"
        MAINTENANCE = "MAINTENANCE", "Maintenance"
        EMERGENCY = "EMERGENCY", "Emergency"
        EVENT = "EVENT", "Event"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"

    title = models.CharField(max_length=200)

    content = models.TextField()

    notice_type = models.CharField(
        max_length=20,
        choices=NoticeType.choices,
        default=NoticeType.GENERAL,
    )

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )

    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="published_notices",
    )

    published_at = models.DateTimeField(auto_now_add=True)

    expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return self.title