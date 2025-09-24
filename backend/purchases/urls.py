from django.urls import path
from . import views

urlpatterns = [
    path('', views.purchase_list_create, name='purchase_list_create'),
    path('<uuid:pk>/', views.purchase_detail, name='purchase_detail'),
]
