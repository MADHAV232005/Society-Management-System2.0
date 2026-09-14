from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.user:
            data["user_name"] = instance.user.get_full_name() or instance.user.username
        return data
