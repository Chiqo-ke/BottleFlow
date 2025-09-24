from django.urls import path
from . import views

urlpatterns = [
    path('', views.worker_list_create, name='worker_list_create'),
    path('<uuid:pk>/', views.worker_detail, name='worker_detail'),
    path('verify/', views.verify_worker, name='verify_worker'),
]
