from rest_framework import serializers
from .models import Task
from workers.serializers import WorkerSummarySerializer
from products.serializers import ProductSerializer

class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    
    worker_name = serializers.CharField(source='worker.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    completion_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'worker', 'worker_name', 'product', 'product_name', 'task_type',
            'assigned_quantity', 'washed_quantity', 'status', 'salary', 'deduction',
            'net_pay', 'completion_percentage', 'date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'net_pay', 'status', 'created_at', 'updated_at']

class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tasks"""
    
    class Meta:
        model = Task
        fields = ['worker', 'product', 'task_type', 'assigned_quantity', 'salary', 'deduction', 'date', 'notes']
    
    def validate(self, attrs):
        task_type = attrs.get('task_type', 'washing')
        
        if task_type == 'washing':
            if not attrs.get('product'):
                raise serializers.ValidationError("Product is required for washing tasks")
            if not attrs.get('assigned_quantity') or attrs.get('assigned_quantity') <= 0:
                raise serializers.ValidationError("Assigned quantity must be greater than 0 for washing tasks")
        elif task_type == 'daily_salary':
            if attrs.get('product'):
                raise serializers.ValidationError("Product should not be specified for daily salary tasks")
            attrs['assigned_quantity'] = 0
            attrs['washed_quantity'] = 0
        
        return attrs

class TaskUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tasks"""
    
    class Meta:
        model = Task
        fields = ['washed_quantity', 'salary', 'deduction', 'notes']
    
    def validate_washed_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Washed quantity cannot be negative")
        
        # Check against assigned quantity for washing tasks
        task = self.instance
        if task and task.task_type == 'washing' and value > task.assigned_quantity:
            raise serializers.ValidationError(f"Washed quantity cannot exceed assigned quantity ({task.assigned_quantity})")
        
        return value

class DailySalaryTaskSerializer(serializers.ModelSerializer):
    """Serializer specifically for daily salary tasks"""
    
    worker_name = serializers.CharField(source='worker.name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['worker', 'worker_name', 'salary', 'deduction', 'net_pay', 'date', 'notes']
        read_only_fields = ['net_pay']

class TaskSummarySerializer(serializers.ModelSerializer):
    """Simplified serializer for task summaries"""
    
    worker_name = serializers.CharField(source='worker.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'worker_name', 'product_name', 'task_type', 'status', 'net_pay', 'date']
