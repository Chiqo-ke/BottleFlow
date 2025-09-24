from django.db import models
import uuid

class Product(models.Model):
    """Product model for bottles and containers"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    wash_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    @property
    def current_stock(self):
        """Calculate current stock from stock movements"""
        from stock.models import StockMovement
        movements = StockMovement.objects.filter(product=self)
        
        raw_stock = 0
        washed_stock = 0
        
        for movement in movements:
            if movement.type == 'purchase':
                raw_stock += movement.quantity
            elif movement.type == 'sell_raw':
                raw_stock -= movement.quantity
            elif movement.type == 'sell_washed':
                washed_stock -= movement.quantity
            elif movement.type == 'assign_wash':
                raw_stock -= movement.quantity
            elif movement.type == 'complete_wash':
                washed_stock += movement.quantity
        
        return {
            'raw': max(0, raw_stock),
            'washed': max(0, washed_stock),
            'total': max(0, raw_stock) + max(0, washed_stock)
        }
    
    class Meta:
        db_table = 'products'
        ordering = ['name']
