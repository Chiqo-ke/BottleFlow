from django.urls import path
from . import views

urlpatterns = [
    path('', views.product_list_create, name='product_list_create'),
    path('<uuid:pk>/', views.product_detail, name='product_detail'),
]
