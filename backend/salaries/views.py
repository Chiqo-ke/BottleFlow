from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import datetime
from workers.models import Worker
from tasks.models import Task
from .models import SalaryPayment
from .serializers import (
    SalaryPaymentSerializer, SalaryPaymentCreateSerializer,
    PendingSalarySerializer, SalarySummarySerializer
)
from audit.utils import log_audit

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_salaries(request):
    """Get list of all workers with their pending salaries"""
    
    workers = Worker.objects.filter(is_active=True)
    pending_data = []
    
    for worker in workers:
        # Calculate total earned from completed tasks
        total_earned = Task.objects.filter(
            worker=worker,
            status='Completed'
        ).aggregate(total=Sum('net_pay'))['total'] or 0
        
        # Calculate total paid
        total_paid = SalaryPayment.objects.filter(
            worker=worker
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        pending_salary = max(0, total_earned - total_paid)
        
        # Get last payment date
        last_payment = SalaryPayment.objects.filter(worker=worker).order_by('-date').first()
        last_payment_date = last_payment.date if last_payment else None
        
        if pending_salary > 0 or request.query_params.get('include_zero') == 'true':
            pending_data.append({
                'worker_id': worker.id,
                'worker_name': worker.name,
                'worker_role': worker.role,
                'pending_salary': pending_salary,
                'total_earned': total_earned,
                'total_paid': total_paid,
                'last_payment_date': last_payment_date
            })
    
    # Sort by pending salary (highest first)
    pending_data.sort(key=lambda x: x['pending_salary'], reverse=True)
    
    serializer = PendingSalarySerializer(pending_data, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def salary_payments(request):
    """List salary payments or create a new payment"""
    
    if request.method == 'GET':
        payments = SalaryPayment.objects.all()
        
        # Filter by worker if specified
        worker_id = request.query_params.get('worker_id')
        if worker_id:
            payments = payments.filter(worker_id=worker_id)
        
        # Filter by date range if specified
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            payments = payments.filter(date__gte=start_date)
        if end_date:
            payments = payments.filter(date__lte=end_date)
        
        serializer = SalaryPaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SalaryPaymentCreateSerializer(data=request.data)
        if serializer.is_valid():
            payment = serializer.save()
            
            # Log audit trail
            log_audit(
                user=request.user,
                action='CREATE_SALARY_PAYMENT',
                details=f'Paid ${payment.amount} to {payment.worker.name}'
            )
            
            return Response(SalaryPaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def worker_salary_history(request, worker_id):
    """Get salary payment history for a specific worker"""
    
    worker = get_object_or_404(Worker, id=worker_id)
    payments = SalaryPayment.objects.filter(worker=worker)
    
    # Get worker's task summary
    tasks_summary = Task.objects.filter(worker=worker, status='Completed').aggregate(
        total_tasks=Count('id'),
        total_earned=Sum('net_pay')
    )
    
    # Get payment summary
    payments_summary = payments.aggregate(
        total_payments=Count('id'),
        total_paid=Sum('amount')
    )
    
    serializer = SalaryPaymentSerializer(payments, many=True)
    
    return Response({
        'worker': {
            'id': worker.id,
            'name': worker.name,
            'role': worker.role
        },
        'summary': {
            'total_tasks_completed': tasks_summary['total_tasks'] or 0,
            'total_earned': tasks_summary['total_earned'] or 0,
            'total_payments_made': payments_summary['total_payments'] or 0,
            'total_amount_paid': payments_summary['total_paid'] or 0,
            'pending_salary': worker.pending_salary
        },
        'payments': serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salary_summary(request):
    """Get salary summary statistics"""
    
    from django.db.models import Count
    
    # Get current month and year
    now = timezone.now()
    current_month = now.month
    current_year = now.year
    
    # Calculate total pending salaries
    workers = Worker.objects.filter(is_active=True)
    total_pending = sum(worker.pending_salary for worker in workers)
    workers_with_pending = sum(1 for worker in workers if worker.pending_salary > 0)
    
    # Calculate payments this month
    payments_this_month = SalaryPayment.objects.filter(
        date__month=current_month,
        date__year=current_year
    )
    
    total_paid_this_month = payments_this_month.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    payments_count_this_month = payments_this_month.count()
    
    # Calculate total paid all time
    total_paid_all_time = SalaryPayment.objects.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    summary_data = {
        'total_pending': total_pending,
        'total_paid_this_month': total_paid_this_month,
        'total_paid_all_time': total_paid_all_time,
        'workers_with_pending': workers_with_pending,
        'payments_this_month': payments_count_this_month
    }
    
    serializer = SalarySummarySerializer(summary_data)
    return Response(serializer.data)
