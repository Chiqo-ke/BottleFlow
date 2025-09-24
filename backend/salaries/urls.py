from django.urls import path
from . import views

urlpatterns = [
    path('pending/', views.pending_salaries, name='pending_salaries'),
    path('payments/', views.salary_payments, name='salary_payments'),
    path('worker/<uuid:worker_id>/', views.worker_salary_history, name='worker_salary_history'),
    path('summary/', views.salary_summary, name='salary_summary'),
]
