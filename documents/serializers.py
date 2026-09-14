from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ["uploaded_by"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.uploaded_by:
            data["uploaded_by_name"] = instance.uploaded_by.get_full_name() or instance.uploaded_by.username
        return data
