from django.db import models
from workers.models import Worker
from products.models import Product
import uuid
from decimal import Decimal

class Task(models.Model):
    """Task model for tracking worker assignments and salaries"""
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]
    
    TASK_TYPES = [
        ('washing', 'Washing Task'),
        ('daily_salary', 'Daily Salary'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='tasks')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)  # Null for daily salary tasks
    task_type = models.CharField(max_length=20, choices=TASK_TYPES, default='washing')
    assigned_quantity = models.PositiveIntegerField(default=0)
    washed_quantity = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Calculate net pay
        self.net_pay = self.salary - self.deduction
        
        # Update status based on progress
        if self.task_type == 'daily_salary':
            self.status = 'Completed'
        elif self.washed_quantity >= self.assigned_quantity and self.assigned_quantity > 0:
            self.status = 'Completed'
        elif self.washed_quantity > 0:
            self.status = 'In Progress'
        
        super().save(*args, **kwargs)
        
        # Create stock movements for washing tasks
        if self.task_type == 'washing' and self.product:
            self._create_stock_movements()
    
    def _create_stock_movements(self):
        """Create stock movements for washing tasks"""
        from stock.models import StockMovement
        
        # Create movement for assigned washing (raw -> in progress)
        if self.assigned_quantity > 0:
            StockMovement.objects.get_or_create(
                product=self.product,
                type='assign_wash',
                quantity=self.assigned_quantity,
                reference_id=str(self.id),
                defaults={
                    'notes': f'Assigned to {self.worker.name} for washing',
                    'created_at': self.created_at
                }
            )
        
        # Create movement for completed washing (in progress -> washed)
        if self.washed_quantity > 0:
            # Check if movement already exists to avoid duplicates
            existing_movement = StockMovement.objects.filter(
                product=self.product,
                type='complete_wash',
                reference_id=str(self.id)
            ).first()
            
            if existing_movement:
                existing_movement.quantity = self.washed_quantity
                existing_movement.save()
            else:
                StockMovement.objects.create(
                    product=self.product,
                    type='complete_wash',
                    quantity=self.washed_quantity,
                    reference_id=str(self.id),
                    notes=f'Completed by {self.worker.name}'
                )
    
    @property
    def completion_percentage(self):
        """Calculate completion percentage"""
        if self.assigned_quantity == 0:
            return 100 if self.task_type == 'daily_salary' else 0
        return min(100, (self.washed_quantity / self.assigned_quantity) * 100)
    
    def __str__(self):
        if self.task_type == 'daily_salary':
            return f"{self.worker.name} - Daily Salary - {self.date}"
        return f"{self.worker.name} - {self.product.name if self.product else 'No Product'} - {self.date}"
    
    class Meta:
        db_table = 'tasks'
        ordering = ['-date', '-created_at']
