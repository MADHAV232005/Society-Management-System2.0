from rest_framework import serializers
from .models import Visitor


class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = "__all__"
        read_only_fields = ["registered_by"]
        extra_kwargs = {
            "flat": {"required": False},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.flat:
            data["flat_number"] = instance.flat.flat_number
            data["wing_name"] = instance.flat.wing.name if instance.flat.wing else ""
        if instance.registered_by:
            data["registered_by_name"] = instance.registered_by.get_full_name() or instance.registered_by.username
        return data
