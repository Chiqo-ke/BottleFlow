from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from products.models import Product
from .models import StockMovement, StockSale
from .serializers import (
    StockMovementSerializer, StockSaleSerializer, 
    StockSaleCreateSerializer, StockOverviewSerializer
)
from audit.utils import log_audit

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_overview(request):
    """Get aggregated stock overview for all products"""
    
    products = Product.objects.all()
    stock_data = []
    
    for product in products:
        current_stock = product.current_stock
        stock_data.append({
            'product_id': product.id,
            'product_name': product.name,
            'raw_stock': current_stock['raw'],
            'washed_stock': current_stock['washed'],
            'total_stock': current_stock['total'],
            'purchase_price': product.purchase_price,
            'wash_price': product.wash_price
        })
    
    serializer = StockOverviewSerializer(stock_data, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_movements(request):
    """Get stock movement history"""
    
    movements = StockMovement.objects.all()
    
    # Filter by product if specified
    product_id = request.query_params.get('product_id')
    if product_id:
        movements = movements.filter(product_id=product_id)
    
    # Filter by movement type if specified
    movement_type = request.query_params.get('type')
    if movement_type:
        movements = movements.filter(type=movement_type)
    
    serializer = StockMovementSerializer(movements, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sell_stock(request):
    """Record a stock sale"""
    
    serializer = StockSaleCreateSerializer(data=request.data)
    if serializer.is_valid():
        sale = serializer.save()
        
        # Log audit trail
        log_audit(
            user=request.user,
            action='SELL_STOCK',
            details=f'Sold {sale.quantity} {sale.sale_type} {sale.product.name} for ${sale.total_amount}'
        )
        
        return Response(StockSaleSerializer(sale).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_sales(request):
    """Get stock sales history"""
    
    sales = StockSale.objects.all()
    
    # Filter by product if specified
    product_id = request.query_params.get('product_id')
    if product_id:
        sales = sales.filter(product_id=product_id)
    
    # Filter by sale type if specified
    sale_type = request.query_params.get('sale_type')
    if sale_type:
        sales = sales.filter(sale_type=sale_type)
    
    serializer = StockSaleSerializer(sales, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_stock_detail(request, product_id):
    """Get detailed stock information for a specific product"""
    
    product = get_object_or_404(Product, id=product_id)
    current_stock = product.current_stock
    
    # Get recent movements for this product
    recent_movements = StockMovement.objects.filter(product=product)[:10]
    movements_serializer = StockMovementSerializer(recent_movements, many=True)
    
    # Get recent sales for this product
    recent_sales = StockSale.objects.filter(product=product)[:10]
    sales_serializer = StockSaleSerializer(recent_sales, many=True)
    
    return Response({
        'product': {
            'id': product.id,
            'name': product.name,
            'purchase_price': product.purchase_price,
            'wash_price': product.wash_price
        },
        'current_stock': current_stock,
        'recent_movements': movements_serializer.data,
        'recent_sales': sales_serializer.data
    })
