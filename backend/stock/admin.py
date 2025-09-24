from django.contrib import admin
from .models import StockMovement, StockSale

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    """Admin configuration for StockMovement model"""
    
    list_display = ['product', 'type', 'quantity', 'reference_id', 'created_at']
    list_filter = ['type', 'created_at', 'product']
    search_fields = ['product__name', 'reference_id', 'notes']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at']

@admin.register(StockSale)
class StockSaleAdmin(admin.ModelAdmin):
    """Admin configuration for StockSale model"""
    
    list_display = ['product', 'sale_type', 'quantity', 'price_per_unit', 'total_amount', 'customer_name', 'date']
    list_filter = ['sale_type', 'date', 'product']
    search_fields = ['product__name', 'customer_name']
    ordering = ['-date', '-created_at']
    readonly_fields = ['id', 'total_amount', 'created_at']
