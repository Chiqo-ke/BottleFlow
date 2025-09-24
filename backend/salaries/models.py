from django.db import models
from workers.models import Worker
import uuid

class SalaryPayment(models.Model):
    """Track salary payments made to workers"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='salary_payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    payment_method = models.CharField(max_length=50, default='Cash')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.worker.name} - ${self.amount} - {self.date}"
    
    class Meta:
        db_table = 'salary_payments'
        ordering = ['-date', '-created_at']
