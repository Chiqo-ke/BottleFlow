from django.db import models
from products.models import Product
import uuid

class Purchase(models.Model):
    """Purchase model for tracking inventory purchases"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Calculate balance automatically
        self.balance = self.total_cost - self.amount_paid
        super().save(*args, **kwargs)
    
    @property
    def is_fully_paid(self):
        return self.balance <= 0
    
    def __str__(self):
        return f"Purchase {self.date} - ${self.total_cost}"
    
    class Meta:
        db_table = 'purchases'
        ordering = ['-date', '-created_at']

class PurchaseItem(models.Model):
    """Individual items in a purchase"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        # Create stock movement when purchase item is created
        super().save(*args, **kwargs)
        
        # Import here to avoid circular imports
        from stock.models import StockMovement
        
        # Create stock movement for this purchase
        stock_movement, created = StockMovement.objects.get_or_create(
            product=self.product,
            type='purchase',
            quantity=self.quantity,
            reference_id=str(self.id),
            defaults={'created_at': self.purchase.created_at}
        )
        if created:
            print(f"DEBUG: Created StockMovement for product {self.product.name}, quantity {self.quantity}, type 'purchase'")
        else:
            print(f"DEBUG: StockMovement already exists for product {self.product.name}, reference_id {self.id}")
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
    
    class Meta:
        db_table = 'purchase_items'
