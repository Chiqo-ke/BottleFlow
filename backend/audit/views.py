from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from .models import AuditLog
from .serializers import AuditLogSerializer, AuditLogSummarySerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_logs(request):
    """Get audit logs (Admin only)"""
    
    # Only admin can view audit logs
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    logs = AuditLog.objects.all()
    
    # Filter by user if specified
    user_id = request.query_params.get('user_id')
    if user_id:
        logs = logs.filter(user_id=user_id)
    
    # Filter by action if specified
    action = request.query_params.get('action')
    if action:
        logs = logs.filter(action=action)
    
    # Filter by date range if specified
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if start_date:
        logs = logs.filter(created_at__date__gte=start_date)
    if end_date:
        logs = logs.filter(created_at__date__lte=end_date)
    
    # Check if summary view is requested
    if request.query_params.get('summary') == 'true':
        serializer = AuditLogSummarySerializer(logs, many=True)
    else:
        serializer = AuditLogSerializer(logs, many=True)
    
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_statistics(request):
    """Get audit statistics (Admin only)"""
    
    # Only admin can view audit statistics
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get basic statistics
    total_logs = AuditLog.objects.count()
    
    # Get action breakdown
    action_breakdown = AuditLog.objects.values('action').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Get user activity breakdown
    user_activity = AuditLog.objects.filter(
        user__isnull=False
    ).values('user__username', 'user__role').annotate(
        count=Count('id')
    ).order_by('-count')[:10]  # Top 10 most active users
    
    # Get recent activity (last 7 days)
    seven_days_ago = timezone.now() - timedelta(days=7)
    recent_activity = AuditLog.objects.filter(
        created_at__gte=seven_days_ago
    ).count()
    
    # Get daily activity for the last 7 days
    daily_activity = []
    for i in range(7):
        date = timezone.now().date() - timedelta(days=i)
        count = AuditLog.objects.filter(
            created_at__date=date
        ).count()
        daily_activity.append({
            'date': date,
            'count': count
        })
    
    return Response({
        'total_logs': total_logs,
        'recent_activity_7_days': recent_activity,
        'action_breakdown': list(action_breakdown),
        'user_activity': list(user_activity),
        'daily_activity': daily_activity
    })
