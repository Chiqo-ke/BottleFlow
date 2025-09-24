from rest_framework import serializers
from .models import SalaryPayment
from workers.models import Worker

class SalaryPaymentSerializer(serializers.ModelSerializer):
    """Serializer for SalaryPayment model"""
    
    worker_name = serializers.CharField(source='worker.name', read_only=True)
    
    class Meta:
        model = SalaryPayment
        fields = ['id', 'worker', 'worker_name', 'amount', 'date', 'payment_method', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

class SalaryPaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating salary payments"""
    
    class Meta:
        model = SalaryPayment
        fields = ['worker', 'amount', 'date', 'payment_method', 'notes']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value
    
    def validate(self, attrs):
        worker = attrs['worker']
        amount = attrs['amount']
        
        # Check if payment amount doesn't exceed pending salary
        pending_salary = worker.pending_salary
        if amount > pending_salary:
            raise serializers.ValidationError(
                f"Payment amount (${amount}) exceeds pending salary (${pending_salary})"
            )
        
        return attrs

class PendingSalarySerializer(serializers.Serializer):
    """Serializer for pending salary information"""
    
    worker_id = serializers.UUIDField()
    worker_name = serializers.CharField()
    worker_role = serializers.CharField()
    pending_salary = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_earned = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    last_payment_date = serializers.DateField(allow_null=True)

class SalarySummarySerializer(serializers.Serializer):
    """Serializer for salary summary statistics"""
    
    total_pending = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_paid_this_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_paid_all_time = serializers.DecimalField(max_digits=12, decimal_places=2)
    workers_with_pending = serializers.IntegerField()
    payments_this_month = serializers.IntegerField()
