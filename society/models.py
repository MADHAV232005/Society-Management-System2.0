from django.conf import settings
from django.db import models


class Society(models.Model):
    name = models.CharField(max_length=150)
    registration_number = models.CharField(
        max_length=100,
        blank=True,
        unique=True,
    )
    address = models.TextField()
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Wing(models.Model):
    society = models.ForeignKey(
        Society,
        on_delete=models.CASCADE,
        related_name="wings",
    )
    name = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["society", "name"],
                name="unique_wing_per_society",
            )
        ]

    def __str__(self):
        return f"{self.society.name} - {self.name}"


class Flat(models.Model):
    wing = models.ForeignKey(
        Wing,
        on_delete=models.CASCADE,
        related_name="flats",
    )
    flat_number = models.CharField(max_length=20)
    floor = models.PositiveIntegerField(default=0)
    area_sqft = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    is_occupied = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["wing", "flat_number"],
                name="unique_flat_per_wing",
            )
        ]

    def __str__(self):
        return f"{self.wing.name} - {self.flat_number}"


class Resident(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resident_profile",
    )
    flat = models.ForeignKey(
        Flat,
        on_delete=models.PROTECT,
        related_name="residents",
    )

    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    move_in_date = models.DateField(null=True, blank=True)
    move_out_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.flat}"