from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Task
from .serializers import (
    TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer,
    DailySalaryTaskSerializer, TaskSummarySerializer
)
from audit.utils import log_audit

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list_create(request):
    """List all tasks or create a new task"""
    
    if request.method == 'GET':
        tasks = Task.objects.all()
        
        # Filter by worker if specified
        worker_id = request.query_params.get('worker_id')
        if worker_id:
            tasks = tasks.filter(worker_id=worker_id)
        
        # Filter by status if specified
        task_status = request.query_params.get('status')
        if task_status:
            tasks = tasks.filter(status=task_status)
        
        # Filter by task type if specified
        task_type = request.query_params.get('task_type')
        if task_type:
            tasks = tasks.filter(task_type=task_type)
        
        # Check if summary view is requested
        if request.query_params.get('summary') == 'true':
            serializer = TaskSummarySerializer(tasks, many=True)
        else:
            serializer = TaskSerializer(tasks, many=True)
        
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TaskCreateSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save()
            
            # Log audit trail
            task_description = f"{task.task_type} task for {task.worker.name}"
            if task.product:
                task_description += f" - {task.product.name}"
            
            log_audit(
                user=request.user,
                action='CREATE_TASK',
                details=task_description
            )
            
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    """Retrieve or update a task"""
    
    task = get_object_or_404(Task, pk=pk)
    
    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = TaskUpdateSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            old_washed = task.washed_quantity
            task = serializer.save()
            
            # Log audit trail
            log_audit(
                user=request.user,
                action='UPDATE_TASK',
                details=f'Updated task for {task.worker.name}: washed quantity {old_washed} -> {task.washed_quantity}'
            )
            
            return Response(TaskSerializer(task).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_daily_salary_task(request):
    """Create a daily salary task for non-washer workers"""
    
    data = request.data.copy()
    data['task_type'] = 'daily_salary'
    data['assigned_quantity'] = 0
    data['washed_quantity'] = 0
    
    serializer = TaskCreateSerializer(data=data)
    if serializer.is_valid():
        task = serializer.save()
        
        # Log audit trail
        log_audit(
            user=request.user,
            action='CREATE_DAILY_SALARY',
            details=f'Created daily salary task for {task.worker.name} - ${task.net_pay}'
        )
        
        return Response(DailySalaryTaskSerializer(task).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def worker_tasks(request, worker_id):
    """Get all tasks for a specific worker"""
    
    tasks = Task.objects.filter(worker_id=worker_id)
    
    # Filter by date range if specified
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if start_date:
        tasks = tasks.filter(date__gte=start_date)
    if end_date:
        tasks = tasks.filter(date__lte=end_date)
    
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_statistics(request):
    """Get task statistics and summaries"""
    
    from django.db.models import Count, Sum, Avg
    from django.utils import timezone
    from datetime import timedelta
    
    # Get basic statistics
    total_tasks = Task.objects.count()
    completed_tasks = Task.objects.filter(status='Completed').count()
    pending_tasks = Task.objects.filter(status='Pending').count()
    in_progress_tasks = Task.objects.filter(status='In Progress').count()
    
    # Get salary statistics
    total_salaries = Task.objects.aggregate(
        total_salary=Sum('salary'),
        total_deductions=Sum('deduction'),
        total_net_pay=Sum('net_pay')
    )
    
    # Get recent task activity (last 30 days)
    thirty_days_ago = timezone.now().date() - timedelta(days=30)
    recent_tasks = Task.objects.filter(date__gte=thirty_days_ago).count()
    
    return Response({
        'task_counts': {
            'total': total_tasks,
            'completed': completed_tasks,
            'pending': pending_tasks,
            'in_progress': in_progress_tasks
        },
        'salary_summary': total_salaries,
        'recent_activity': {
            'tasks_last_30_days': recent_tasks
        }
    })
