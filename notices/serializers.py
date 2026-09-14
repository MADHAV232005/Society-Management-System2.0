from rest_framework import serializers
from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = "__all__"
        read_only_fields = ["published_by"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.published_by:
            data["published_by_name"] = instance.published_by.get_full_name() or instance.published_by.username
        return data
