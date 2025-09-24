from rest_framework import serializers
from .models import StockMovement, StockSale
from products.models import Product

class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer for StockMovement model"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = ['id', 'product', 'product_name', 'type', 'quantity', 'reference_id', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

class StockSaleSerializer(serializers.ModelSerializer):
    """Serializer for StockSale model"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = StockSale
        fields = [
            'id', 'product', 'product_name', 'sale_type', 'quantity', 
            'price_per_unit', 'total_amount', 'customer_name', 'notes', 
            'date', 'created_at'
        ]
        read_only_fields = ['id', 'total_amount', 'created_at']

class StockSaleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating stock sales"""
    
    class Meta:
        model = StockSale
        fields = ['product', 'sale_type', 'quantity', 'price_per_unit', 'customer_name', 'notes', 'date']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_price_per_unit(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price per unit must be greater than 0")
        return value
    
    def validate(self, attrs):
        product = attrs['product']
        sale_type = attrs['sale_type']
        quantity = attrs['quantity']
        
        # Check if enough stock is available
        current_stock = product.current_stock
        
        if sale_type == 'raw' and current_stock['raw'] < quantity:
            raise serializers.ValidationError(f"Insufficient raw stock. Available: {current_stock['raw']}")
        elif sale_type == 'washed' and current_stock['washed'] < quantity:
            raise serializers.ValidationError(f"Insufficient washed stock. Available: {current_stock['washed']}")
        
        return attrs

class StockOverviewSerializer(serializers.Serializer):
    """Serializer for stock overview"""
    
    product_id = serializers.UUIDField()
    product_name = serializers.CharField()
    raw_stock = serializers.IntegerField()
    washed_stock = serializers.IntegerField()
    total_stock = serializers.IntegerField()
    purchase_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    wash_price = serializers.DecimalField(max_digits=10, decimal_places=2)
