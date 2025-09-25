from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid

class UserManager(BaseUserManager):
    """Custom user manager with role support"""
    
    def create_user(self, username, email=None, password=None, role='manager', **extra_fields):
        """Create and return a regular user with the given username, email, and password."""
        if not username:
            raise ValueError('The Username field must be set')
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """Create and return a superuser with admin role."""
        # Set default superuser fields
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')  # Default to admin role
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    """Custom User model with role-based access"""
    
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='manager')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use custom manager
    objects = UserManager()
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    class Meta:
        db_table = 'users'
