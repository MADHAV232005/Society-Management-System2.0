from rest_framework import serializers
from .models import MaintenanceBill, Payment, Receipt


class MaintenanceBillSerializer(serializers.ModelSerializer):
    total_paid = serializers.ReadOnlyField()
    pending_amount = serializers.ReadOnlyField()

    class Meta:
        model = MaintenanceBill
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.flat:
            data["flat_number"] = instance.flat.flat_number
            data["wing_name"] = instance.flat.wing.name if instance.flat.wing else ""
        return data


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.bill and instance.bill.flat:
            data["flat_number"] = instance.bill.flat.flat_number
            data["wing_name"] = instance.bill.flat.wing.name if instance.bill.flat.wing else ""
            data["billing_month"] = str(instance.bill.billing_month)
        return data


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.payment:
            data["amount"] = str(instance.payment.amount)
            data["payment_method"] = instance.payment.payment_method
            data["transaction_reference"] = instance.payment.transaction_reference
            if instance.payment.bill and instance.payment.bill.flat:
                data["flat_number"] = instance.payment.bill.flat.flat_number
                data["wing_name"] = instance.payment.bill.flat.wing.name if instance.payment.bill.flat.wing else ""
        return data
