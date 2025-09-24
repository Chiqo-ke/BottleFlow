from django.contrib import admin
from .models import SalaryPayment

@admin.register(SalaryPayment)
class SalaryPaymentAdmin(admin.ModelAdmin):
    """Admin configuration for SalaryPayment model"""
    
    list_display = ['worker', 'amount', 'date', 'payment_method', 'created_at']
    list_filter = ['payment_method', 'date', 'worker']
    search_fields = ['worker__name', 'notes']
    ordering = ['-date', '-created_at']
    readonly_fields = ['id', 'created_at']
