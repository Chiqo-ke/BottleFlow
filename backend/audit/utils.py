from .models import AuditLog

def log_audit(user, action, details, request=None):
    """
    Utility function to create audit log entries
    
    Args:
        user: The user performing the action
        action: The action being performed (from ACTION_CHOICES)
        details: Detailed description of the action
        request: Optional HTTP request object for IP and user agent
    """
    
    ip_address = None
    user_agent = None
    
    if request:
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    AuditLog.objects.create(
        user=user,
        action=action,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
