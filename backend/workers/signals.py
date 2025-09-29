from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError

from .email_service import create_manager_account, send_manager_credentials_email
from .models import Worker

@receiver(post_save, sender=Worker)
def create_manager_user(sender, instance, created, **kwargs):
    """
    Signal to automatically create a user account when a worker with the
    'manager' role is created. This will be called from the view.
    """
    # Ensure this runs only once when the worker is first created
    if created and instance.role.lower() == 'manager':
        # Check if an email is provided
        if not instance.email:
            print(f"Warning: Manager worker '{instance.name}' created without an email. Cannot create user account.")
            return
        
        # Use the service to create the account
        result = create_manager_account(instance.name, instance.email)
        
        if result['success']:
            user = result['user']
            # Link the new user account to the worker instance
            instance.user_account = user
            instance.save(update_fields=['user_account'])
            
            # Send credentials via email
            send_manager_credentials_email(instance.name, user.email, result['username'], result['password'])
            print(f"Successfully created and linked manager user for '{user.email}'.")
        else:
            # Raise an exception that can be caught by the view
            raise ValidationError(result['message'])