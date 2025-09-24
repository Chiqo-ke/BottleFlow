from django.db import models
from products.models import Product
import uuid

class StockMovement(models.Model):
    """Track all stock movements for inventory management"""
    
    MOVEMENT_TYPES = [
        ('purchase', 'Purchase'),
        ('sell_raw', 'Sell Raw'),
        ('sell_washed', 'Sell Washed'),
        ('assign_wash', 'Assign for Washing'),
        ('complete_wash', 'Complete Washing'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()  # Can be negative for outgoing stock
    reference_id = models.CharField(max_length=100, blank=True, null=True)  # Reference to related record
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.name} - {self.type} - {self.quantity}"
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']

class StockSale(models.Model):
    """Track sales of raw or washed stock"""
    
    SALE_TYPES = [
        ('raw', 'Raw Stock'),
        ('washed', 'Washed Stock'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    sale_type = models.CharField(max_length=10, choices=SALE_TYPES)
    quantity = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    customer_name = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Calculate total amount
        self.total_amount = self.quantity * self.price_per_unit
        
        # Create stock movement
        super().save(*args, **kwargs)
        
        movement_type = 'sell_raw' if self.sale_type == 'raw' else 'sell_washed'
        StockMovement.objects.create(
            product=self.product,
            type=movement_type,
            quantity=-self.quantity,  # Negative because it's outgoing
            reference_id=str(self.id),
            notes=f"Sale to {self.customer_name or 'Customer'}"
        )
    
    def __str__(self):
        return f"{self.product.name} - {self.sale_type} - {self.quantity} units"
    
    class Meta:
        db_table = 'stock_sales'
        ordering = ['-date', '-created_at']
