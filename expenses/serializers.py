from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["recorded_by"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.recorded_by:
            data["recorded_by_name"] = instance.recorded_by.get_full_name() or instance.recorded_by.username
        return data
