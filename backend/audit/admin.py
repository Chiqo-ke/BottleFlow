from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin configuration for AuditLog model"""
    
    list_display = ['user', 'action', 'details', 'ip_address', 'created_at']
    list_filter = ['action', 'created_at', 'user']
    search_fields = ['user__username', 'action', 'details', 'ip_address']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at']
    
    def has_add_permission(self, request):
        # Prevent manual creation of audit logs
        return False
    
    def has_change_permission(self, request, obj=None):
        # Prevent modification of audit logs
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Only allow deletion for cleanup purposes
        return request.user.is_superuser
