from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """Admin configuration for Task model"""
    
    list_display = [
        'worker', 'product', 'task_type', 'assigned_quantity', 
        'washed_quantity', 'status', 'salary', 'net_pay', 'date'
    ]
    list_filter = ['task_type', 'status', 'date', 'worker', 'product']
    search_fields = ['worker__name', 'product__name', 'notes']
    ordering = ['-date', '-created_at']
    readonly_fields = ['id', 'net_pay', 'completion_percentage', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('worker', 'product', 'task_type', 'date')
        }),
        ('Task Details', {
            'fields': ('assigned_quantity', 'washed_quantity', 'status')
        }),
        ('Payment Information', {
            'fields': ('salary', 'deduction', 'net_pay')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('System Information', {
            'fields': ('id', 'completion_percentage', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
