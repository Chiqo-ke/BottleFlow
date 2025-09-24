from django.urls import path
from . import views

urlpatterns = [
    path('', views.task_list_create, name='task_list_create'),
    path('<uuid:pk>/', views.task_detail, name='task_detail'),
    path('daily-salary/', views.create_daily_salary_task, name='create_daily_salary_task'),
    path('worker/<uuid:worker_id>/', views.worker_tasks, name='worker_tasks'),
    path('statistics/', views.task_statistics, name='task_statistics'),
]
