from rest_framework import serializers
from .models import Complaint, ComplaintStatusHistory


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.resident:
            data["resident_name"] = instance.resident.get_full_name() or instance.resident.username
        if instance.flat:
            data["flat_number"] = instance.flat.flat_number
            data["wing_name"] = instance.flat.wing.name if instance.flat.wing else ""
        if instance.assigned_to:
            data["assigned_to_name"] = instance.assigned_to.get_full_name() or instance.assigned_to.username
        return data


class ComplaintStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintStatusHistory
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.changed_by:
            data["changed_by_name"] = instance.changed_by.get_full_name() or instance.changed_by.username
        return data
