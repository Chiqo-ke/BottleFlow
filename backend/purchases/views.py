from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Purchase
from .serializers import PurchaseSerializer, PurchaseCreateSerializer, PurchaseSummarySerializer
from audit.utils import log_audit

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def purchase_list_create(request):
    """List all purchases or create a new purchase"""
    
    if request.method == 'GET':
        purchases = Purchase.objects.all()
        
        # Check if summary view is requested
        if request.query_params.get('summary') == 'true':
            serializer = PurchaseSummarySerializer(purchases, many=True)
        else:
            serializer = PurchaseSerializer(purchases, many=True)
        
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PurchaseCreateSerializer(data=request.data)
        if serializer.is_valid():
            purchase = serializer.save()
            
            # Log audit trail
            log_audit(
                user=request.user,
                action='CREATE_PURCHASE',
                details=f'Created purchase for ${purchase.total_cost} with {purchase.items.count()} items'
            )
            
            return Response(PurchaseSerializer(purchase).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def purchase_detail(request, pk):
    """Retrieve or update a purchase"""
    
    purchase = get_object_or_404(Purchase, pk=pk)
    
    if request.method == 'GET':
        serializer = PurchaseSerializer(purchase)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Only allow updating payment information
        allowed_fields = ['amount_paid', 'notes']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = PurchaseSerializer(purchase, data=update_data, partial=True)
        if serializer.is_valid():
            old_amount = purchase.amount_paid
            purchase = serializer.save()
            
            # Log audit trail
            log_audit(
                user=request.user,
                action='UPDATE_PURCHASE',
                details=f'Updated purchase payment: ${old_amount} -> ${purchase.amount_paid}'
            )
            
            return Response(PurchaseSerializer(purchase).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
