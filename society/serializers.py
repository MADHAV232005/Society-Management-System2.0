from rest_framework import serializers
from .models import Society, Wing, Flat, Resident


class SocietySerializer(serializers.ModelSerializer):
    class Meta:
        model = Society
        fields = "__all__"


class WingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wing
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["society_name"] = instance.society.name if instance.society else ""
        return data


class FlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["wing_name"] = instance.wing.name if instance.wing else ""
        data["society_name"] = instance.wing.society.name if instance.wing and instance.wing.society else ""
        return data


class ResidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resident
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.user:
            data["user_id"] = instance.user.id
            data["username"] = instance.user.username
            data["user_name"] = instance.user.get_full_name() or instance.user.username
            data["name"] = instance.user.get_full_name() or instance.user.username
            data["email"] = instance.user.email
            data["phone"] = instance.user.phone
            data["role"] = instance.user.role
        if instance.flat:
            data["flat_number"] = instance.flat.flat_number
            data["wing_name"] = instance.flat.wing.name if instance.flat.wing else ""
            data["floor"] = instance.flat.floor
        return data
