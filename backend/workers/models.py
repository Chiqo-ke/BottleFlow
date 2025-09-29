from django.db import models
import uuid
from django.conf import settings

class Worker(models.Model):
    """Worker model for managing employees"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    id_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=50, default='Washer')
    email = models.EmailField(blank=True, null=True, help_text='Required for manager role')
    user_account = models.OneToOneField('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, help_text='Associated user account for managers')
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

class WorkerHistory(models.Model):
    """Model to store history of deleted workers for audit purposes."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker_id = models.UUIDField(help_text="Original ID of the worker")
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    id_number = models.CharField(max_length=20)
    role = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='deleted_workers'
    )
    reason = models.TextField(blank=True, help_text="Reason for deletion")
    deleted_at = models.DateTimeField(auto_now_add=True)
    
    original_created_at = models.DateTimeField()
    original_updated_at = models.DateTimeField()

    def __str__(self):
        return f"History for {self.name} ({self.worker_id})"
    
    class Meta:
        db_table = 'worker_history'
        ordering = ['-deleted_at']
        verbose_name_plural = 'Worker Histories'
