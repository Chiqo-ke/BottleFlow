from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, redirect
from .models import Worker, WorkerHistory
from .serializers import WorkerSerializer, WorkerCreateUpdateSerializer
from .email_service import create_manager_account, send_manager_credentials_email
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
            
            # If worker is a manager, create user account and send credentials
            if worker.role.lower() == 'manager' and worker.email:
                print(f"\n🔄 Creating manager account for {worker.name} ({worker.email})...")
                account_result = create_manager_account(worker.name, worker.email)
                
                if account_result['success']:
                    # Link the user account to the worker
                    worker.user_account = account_result['user']
                    worker.save()
                    
                    print(f"🔄 Sending credentials email to {worker.email}...")
                    # Send credentials email
                    email_sent = send_manager_credentials_email(
                        worker.name,
                        worker.email,
                        account_result['username'],
                        account_result['password'],
                        admin_user=request.user
                    )
                    
                    # Log audit trail with email status
                    email_status = "with email sent" if email_sent else "but email failed"
                    log_audit(
                        user=request.user,
                        action='CREATE_MANAGER_WORKER',
                        details=f'Created manager worker: {worker.name} with account {account_result["username"]} {email_status}'
                    )
                    
                    response_data = WorkerSerializer(worker).data
                    response_data['account_created'] = True
                    response_data['email_sent'] = email_sent
                    response_data['username'] = account_result['username']
                    response_data['message'] = f"Manager {worker.name} created successfully. {'Email sent.' if email_sent else 'Email sending failed - check console for details.'}"
                    
                    print(f"✅ Manager creation completed for {worker.name}")
                    return Response(response_data, status=status.HTTP_201_CREATED)
                else:
                    # Account creation failed, but worker was created
                    print(f"❌ Account creation failed for {worker.name}: {account_result['error']}")
                    log_audit(
                        user=request.user,
                        action='CREATE_WORKER_ACCOUNT_FAILED',
                        details=f'Created worker: {worker.name} but failed to create account: {account_result["error"]}'
                    )
                    
                    response_data = WorkerSerializer(worker).data
                    response_data['account_created'] = False
                    response_data['account_error'] = account_result['error']
                    response_data['message'] = f"Worker {worker.name} created but manager account creation failed: {account_result['error']}"
                    
                    return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                # Regular worker (non-manager) or manager without email
                if worker.role.lower() == 'manager' and not worker.email:
                    print(f"⚠️  Manager {worker.name} created without email - no account will be created")
                    
                log_audit(
                    user=request.user,
                    action='CREATE_WORKER',
                    details=f'Created worker: {worker.name} ({worker.id_number})'
                )
                
                response_data = WorkerSerializer(worker).data
                if worker.role.lower() == 'manager' and not worker.email:
                    response_data['message'] = f"Manager {worker.name} created but no email provided - no user account created"
                else:
                    response_data['message'] = f"Worker {worker.name} created successfully"
                
                return Response(response_data, status=status.HTTP_201_CREATED)
        
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

        # Create a history record before deleting
        WorkerHistory.objects.create(
            worker_id=worker.id,
            name=worker_name,
            phone_number=worker.phone_number,
            id_number=worker.id_number,
            role=worker.role,
            email=worker.email,
            deleted_by=request.user,
            reason=request.data.get('reason', 'No reason provided.'),
            original_created_at=worker.created_at,
            original_updated_at=worker.updated_at
        )
        worker.delete()
        
        # Log audit trail
        log_audit(
            user=request.user,
            action='DELETE_WORKER',
            details=f'Deleted and archived worker: {worker_name}'
        )
        
        return Response({'message': 'Worker deleted and archived successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_worker(request):
    """Verify worker creation with code (placeholder for future implementation)"""
    # This endpoint can be implemented later for email verification
    return Response({'message': 'Worker verification not implemented yet'}, status=status.HTTP_501_NOT_IMPLEMENTED)
