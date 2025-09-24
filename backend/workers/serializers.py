from rest_framework import serializers
from .models import Worker

class WorkerSerializer(serializers.ModelSerializer):
    """Serializer for Worker model"""
    
    pending_salary = serializers.ReadOnlyField()
    total_tasks_completed = serializers.ReadOnlyField()
    
    class Meta:
        model = Worker
        fields = [
            'id', 'name', 'phone_number', 'id_number', 'role', 'is_active',
            'pending_salary', 'total_tasks_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class WorkerCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating workers"""
    
    class Meta:
        model = Worker
        fields = ['name', 'phone_number', 'id_number', 'role', 'is_active']
    
    def validate_phone_number(self, value):
        # Basic phone number validation
        if not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError("Invalid phone number format")
        return value
    
    def validate_id_number(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("ID number must be at least 5 characters")
        return value

class WorkerSummarySerializer(serializers.ModelSerializer):
    """Simplified serializer for worker summaries"""
    
    class Meta:
        model = Worker
        fields = ['id', 'name', 'role']
