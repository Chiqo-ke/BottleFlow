from django.db import models
from django.conf import settings
import uuid

class AuditLog(models.Model):
    """Audit log model for tracking user actions"""
    
    ACTION_CHOICES = [
        ('CREATE_PRODUCT', 'Create Product'),
        ('UPDATE_PRODUCT', 'Update Product'),
        ('DELETE_PRODUCT', 'Delete Product'),
        ('CREATE_WORKER', 'Create Worker'),
        ('UPDATE_WORKER', 'Update Worker'),
        ('DELETE_WORKER', 'Delete Worker'),
        ('CREATE_PURCHASE', 'Create Purchase'),
        ('UPDATE_PURCHASE', 'Update Purchase'),
        ('CREATE_TASK', 'Create Task'),
        ('UPDATE_TASK', 'Update Task'),
        ('CREATE_DAILY_SALARY', 'Create Daily Salary'),
        ('CREATE_SALARY_PAYMENT', 'Create Salary Payment'),
        ('SELL_STOCK', 'Sell Stock'),
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('OTHER', 'Other Action'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        user_name = self.user.username if self.user else 'Anonymous'
        return f"{user_name} - {self.action} - {self.created_at}"
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
