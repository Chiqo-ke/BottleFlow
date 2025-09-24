from django.contrib import admin
from .models import Purchase, PurchaseItem

class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 0
    readonly_fields = ['id']

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    """Admin configuration for Purchase model"""
    
    list_display = ['date', 'total_cost', 'amount_paid', 'balance', 'is_fully_paid', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['notes']
    ordering = ['-date', '-created_at']
    readonly_fields = ['id', 'balance', 'created_at']
    inlines = [PurchaseItemInline]

@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    """Admin configuration for PurchaseItem model"""
    
    list_display = ['purchase', 'product', 'quantity', 'cost']
    list_filter = ['purchase__date', 'product']
    search_fields = ['product__name']
    readonly_fields = ['id']
