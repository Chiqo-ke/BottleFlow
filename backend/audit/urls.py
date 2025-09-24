from django.urls import path
from . import views

urlpatterns = [
    path('', views.audit_logs, name='audit_logs'),
    path('statistics/', views.audit_statistics, name='audit_statistics'),
]
