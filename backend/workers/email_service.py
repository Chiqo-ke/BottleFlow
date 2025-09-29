"""
Email service for sending manager account credentials
"""
import secrets
import string
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from authentication.models import User

# Set up logging
logger = logging.getLogger(__name__)

def send_email(subject, message, recipient_list, from_email=None, fail_silently=False):
    """
    Utility function to send emails.
    """
    try:
        # Use default from_email if none is provided
        from_email = from_email or settings.DEFAULT_FROM_EMAIL

        logger.info(f"Attempting to send email to {recipient_list}")
        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=fail_silently,
        )
        logger.info(f"Successfully sent email to {recipient_list}")
        print(f"✅ Email sent successfully to {recipient_list}")
        return True
    except Exception as e:
        error_msg = f"Failed to send email to {recipient_list}: {str(e)}"
        logger.error(error_msg)
        print(f"❌ EMAIL ERROR: {error_msg}")
        # Print detailed error information
        print(f"Email Backend: {getattr(settings, 'EMAIL_BACKEND', 'Not set')}")
        print(f"Email Host: {getattr(settings, 'EMAIL_HOST', 'Not set')}")
        print(f"Email Port: {getattr(settings, 'EMAIL_PORT', 'Not set')}")
        print(f"Email User: {getattr(settings, 'EMAIL_HOST_USER', 'Not set')}")
        return False

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
    
    # Ensure username is at least 3 characters
    if len(username) < 3:
        username = f"user{username}"
    
    # Ensure username is unique
    counter = 1
    original_username = username
    while User.objects.filter(username=username).exists():
        username = f"{original_username}{counter}"
        counter += 1
    
    logger.info(f"Generated unique username: {username} from email: {email}")
    return username

def create_manager_account(name, email):
    """
    Create a manager user account and return credentials
    Returns: dict with username, password, and success status
    """
    try:
        logger.info(f"Creating manager account for {name} ({email})")
        
        # Check if user with this email already exists
        if User.objects.filter(email=email).exists():
            error_msg = f"User with email {email} already exists"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg,
                'message': 'Manager account creation failed - email already exists'
            }
        
        # Generate credentials
        username = generate_username_from_email(email)
        password = generate_password()
        
        logger.info(f"Generated username: {username} for {email}")
        
        # Create user account
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='manager'
        )
        
        logger.info(f"Successfully created manager account for {name} with username {username}")
        print(f"✅ Manager account created: {username} for {name} ({email})")
        
        return {
            'success': True,
            'user': user,
            'username': username,
            'password': password,
            'message': 'Manager account created successfully'
        }
        
    except Exception as e:
        error_msg = f"Failed to create manager account for {name} ({email}): {str(e)}"
        logger.error(error_msg)
        print(f"❌ ACCOUNT CREATION ERROR: {error_msg}")
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
        logger.info(f"Attempting to send manager credentials email to {email}")
        
        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            error_msg = "Email credentials not configured. Please set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in your .env file. Refer to EMAIL_SETUP_GUIDE.md for details."
            logger.error(error_msg)
            print(f"❌ EMAIL CONFIG ERROR: {error_msg}")
            return {'success': False, 'message': 'Email server is not configured.'}
        
        email_sent = send_email(
            subject,
            message,
            [email],
            fail_silently=False,
            from_email=from_email,
        )

        if email_sent:
            return {'success': True, 'message': f'Credentials successfully sent to {email}.'}
        else:
            # send_email already logs the specific error
            return {'success': False, 'message': 'Failed to send credentials email.'}
        
    except Exception as e:
        error_msg = f"Failed to send email to {email}: {str(e)}"
        logger.error(error_msg)
        print(f"❌ EMAIL SENDING ERROR: {error_msg}")
        return {
            'success': False,
            'message': 'An unexpected error occurred while trying to send the email.'
        }
