from django.urls import path
from . import views

urlpatterns = [
    path('', views.stock_overview, name='stock_overview'),
    path('movements/', views.stock_movements, name='stock_movements'),
    path('sales/', views.stock_sales, name='stock_sales'),
    path('sell/', views.sell_stock, name='sell_stock'),
    path('<uuid:product_id>/', views.product_stock_detail, name='product_stock_detail'),
]
