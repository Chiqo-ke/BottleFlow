from rest_framework import serializers
from .models import Purchase, PurchaseItem
from products.serializers import ProductSerializer

class PurchaseItemSerializer(serializers.ModelSerializer):
    """Serializer for PurchaseItem model"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = PurchaseItem
        fields = ['id', 'product', 'product_name', 'quantity', 'cost']
        read_only_fields = ['id']

class PurchaseItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating purchase items"""
    
    class Meta:
        model = PurchaseItem
        fields = ['product', 'quantity', 'cost']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_cost(self, value):
        if value <= 0:
            raise serializers.ValidationError("Cost must be greater than 0")
        return value

class PurchaseSerializer(serializers.ModelSerializer):
    """Serializer for Purchase model"""
    
    items = PurchaseItemSerializer(many=True, read_only=True)
    is_fully_paid = serializers.ReadOnlyField()
    
    class Meta:
        model = Purchase
        fields = [
            'id', 'total_cost', 'amount_paid', 'balance', 'date', 'notes',
            'is_fully_paid', 'items', 'created_at'
        ]
        read_only_fields = ['id', 'balance', 'created_at']

class PurchaseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating purchases"""
    
    items = PurchaseItemCreateSerializer(many=True)
    
    class Meta:
        model = Purchase
        fields = ['date', 'amount_paid', 'notes', 'items']
    
    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required")
        return value
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate total cost from items
        total_cost = sum(item['cost'] for item in items_data)
        validated_data['total_cost'] = total_cost
        
        # Create purchase
        purchase = Purchase.objects.create(**validated_data)
        
        # Create purchase items
        for item_data in items_data:
            PurchaseItem.objects.create(purchase=purchase, **item_data)
        
        return purchase

class PurchaseSummarySerializer(serializers.ModelSerializer):
    """Simplified serializer for purchase summaries"""
    
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Purchase
        fields = ['id', 'total_cost', 'amount_paid', 'balance', 'date', 'items_count']
    
    def get_items_count(self, obj):
        return obj.items.count()
