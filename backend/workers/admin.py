from django.contrib import admin
from .models import Worker

@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    """Admin configuration for Worker model"""
    
    list_display = ['name', 'role', 'phone_number', 'id_number', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['name', 'phone_number', 'id_number']
    ordering = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at']
