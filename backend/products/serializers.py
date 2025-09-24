from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    
    current_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'purchase_price', 'wash_price', 'current_stock', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating products"""
    
    class Meta:
        model = Product
        fields = ['name', 'purchase_price', 'wash_price']
    
    def validate_purchase_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Purchase price must be greater than 0")
        return value
    
    def validate_wash_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Wash price must be greater than 0")
        return value
