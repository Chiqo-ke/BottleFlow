"""
Email service for sending manager account credentials
"""
import secrets
import string
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from authentication.models import User

def generate_password(length=12):
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def generate_username_from_email(email):
    """Generate a username from email address"""
    base_username = email.split('@')[0].lower()
    # Remove any non-alphanumeric characters
    username = ''.join(c for c in base_username if c.isalnum())
    
    # Ensure username is unique
    counter = 1
    original_username = username
    while User.objects.filter(username=username).exists():
        username = f"{original_username}{counter}"
        counter += 1
    
    return username

def create_manager_account(name, email):
    """
    Create a manager user account and return credentials
    Returns: dict with username, password, and success status
    """
    try:
        # Generate credentials
        username = generate_username_from_email(email)
        password = generate_password()
        
        # Create user account
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='manager'
        )
        
        return {
            'success': True,
            'user': user,
            'username': username,
            'password': password,
            'message': 'Manager account created successfully'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to create manager account'
        }

def send_manager_credentials_email(name, email, username, password, admin_user=None):
    """Send manager account credentials via email"""
    subject = f'BottleFlow Manager Account Created - Welcome {name}!'
    
    # Use admin user's email as sender if provided, otherwise use default
    from_email = admin_user.email if admin_user and admin_user.email else settings.DEFAULT_FROM_EMAIL
    admin_name = admin_user.username if admin_user else 'BottleFlow Admin'
    
    message = f"""Hello {name},

Welcome to BottleFlow! Your manager account has been created by {admin_name}.

Your login credentials are:
Username: {username}
Password: {password}

Please keep these credentials secure and change your password after first login.

You can access the system at: {getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}

If you have any questions, please contact {admin_name} at {from_email}.

Best regards,
{admin_name}"""
    
    try:
        send_mail(
            subject,
            message,
            from_email,
            [email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
