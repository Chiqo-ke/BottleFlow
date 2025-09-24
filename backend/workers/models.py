from django.db import models
import uuid

class Worker(models.Model):
    """Worker model for managing employees"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    id_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=50, default='Washer')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.role})"
    
    @property
    def pending_salary(self):
        """Calculate pending salary for this worker"""
        from tasks.models import Task
        from salaries.models import SalaryPayment
        
        # Get total net pay from completed tasks
        total_earned = Task.objects.filter(
            worker=self,
            status='Completed'
        ).aggregate(
            total=models.Sum('net_pay')
        )['total'] or 0
        
        # Get total payments made
        total_paid = SalaryPayment.objects.filter(
            worker=self
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        return max(0, total_earned - total_paid)
    
    @property
    def total_tasks_completed(self):
        """Get total number of completed tasks"""
        from tasks.models import Task
        return Task.objects.filter(worker=self, status='Completed').count()
    
    class Meta:
        db_table = 'workers'
        ordering = ['name']
