from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Worker
from .serializers import WorkerSerializer, WorkerCreateUpdateSerializer
from audit.utils import log_audit

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def worker_list_create(request):
    """List all workers or create a new worker"""
    
    if request.method == 'GET':
        workers = Worker.objects.filter(is_active=True)
        serializer = WorkerSerializer(workers, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Only admin can create workers
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = WorkerCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            worker = serializer.save()
            
            # Log audit trail
            log_audit(
                user=request.user,
                action='CREATE_WORKER',
                details=f'Created worker: {worker.name} ({worker.id_number})'
            )
            
            return Response(WorkerSerializer(worker).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def worker_detail(request, pk):
    """Retrieve, update or delete a worker"""
    
    worker = get_object_or_404(Worker, pk=pk)
    
    if request.method == 'GET':
        serializer = WorkerSerializer(worker)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Only admin can update workers
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = WorkerCreateUpdateSerializer(worker, data=request.data)
        if serializer.is_valid():
            old_name = worker.name
            worker = serializer.save()
            
            # Log audit trail
            log_audit(
                user=request.user,
                action='UPDATE_WORKER',
                details=f'Updated worker: {old_name} -> {worker.name}'
            )
            
            return Response(WorkerSerializer(worker).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only admin can delete workers (soft delete)
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        worker_name = worker.name
        worker.is_active = False
        worker.save()
        
        # Log audit trail
        log_audit(
            user=request.user,
            action='DELETE_WORKER',
            details=f'Deactivated worker: {worker_name}'
        )
        
        return Response({'message': 'Worker deactivated successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_worker(request):
    """Verify worker creation with code (placeholder for future implementation)"""
    # This endpoint can be implemented later for email verification
    return Response({'message': 'Worker verification not implemented yet'}, status=status.HTTP_501_NOT_IMPLEMENTED)
