from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Product
from .serializers import ProductSerializer, ProductCreateUpdateSerializer
from audit.utils import log_audit

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_list_create(request):
    """List all products or create a new product"""
    
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Only admin can create products
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            
            # Log audit trail
            log_audit(
                user=request.user,
                action='CREATE_PRODUCT',
                details=f'Created product: {product.name}'
            )
            
            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    """Retrieve, update or delete a product"""
    
    product = get_object_or_404(Product, pk=pk)
    
    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Only admin can update products
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductCreateUpdateSerializer(product, data=request.data)
        if serializer.is_valid():
            old_name = product.name
            product = serializer.save()
            
            # Log audit trail
            log_audit(
                user=request.user,
                action='UPDATE_PRODUCT',
                details=f'Updated product: {old_name} -> {product.name}'
            )
            
            return Response(ProductSerializer(product).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only admin can delete products
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        product_name = product.name
        product.delete()
        
        # Log audit trail
        log_audit(
            user=request.user,
            action='DELETE_PRODUCT',
            details=f'Deleted product: {product_name}'
        )
        
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
