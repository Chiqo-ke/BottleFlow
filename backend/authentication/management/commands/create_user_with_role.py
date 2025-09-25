from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import getpass

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a user with specific role (admin or manager)'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username for the new user')
        parser.add_argument('--email', type=str, help='Email for the new user')
        parser.add_argument('--role', type=str, choices=['admin', 'manager'], 
                          help='Role for the new user (admin or manager)')
        parser.add_argument('--password', type=str, help='Password for the new user')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 BottleFlow User Creation'))
        self.stdout.write('=' * 40)
        
        # Get username
        username = options.get('username')
        if not username:
            username = input('Username: ').strip()
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.ERROR(f'❌ User "{username}" already exists!')
            )
            return
        
        # Get email
        email = options.get('email')
        if not email:
            email = input('Email: ').strip()
        
        # Get role
        role = options.get('role')
        if not role:
            self.stdout.write('\nAvailable roles:')
            self.stdout.write('  1. admin   - Full system access')
            self.stdout.write('  2. manager - Limited management access')
            
            while True:
                role_choice = input('\nSelect role (admin/manager): ').strip().lower()
                if role_choice in ['admin', 'manager']:
                    role = role_choice
                    break
                else:
                    self.stdout.write(
                        self.style.ERROR('Please enter "admin" or "manager"')
                    )
        
        # Get password
        password = options.get('password')
        if not password:
            password = getpass.getpass('Password: ')
            password_confirm = getpass.getpass('Confirm password: ')
            
            if password != password_confirm:
                self.stdout.write(
                    self.style.ERROR('❌ Passwords do not match!')
                )
                return
        
        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role=role
            )
            
            # Set superuser status for admin role
            if role == 'admin':
                user.is_staff = True
                user.is_superuser = True
                user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ User "{username}" created successfully!')
            )
            self.stdout.write(f'   Role: {role.title()}')
            self.stdout.write(f'   Email: {email}')
            self.stdout.write(f'   Staff Access: {"Yes" if user.is_staff else "No"}')
            self.stdout.write(f'   Superuser: {"Yes" if user.is_superuser else "No"}')
            
        except ValidationError as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Validation error: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error creating user: {e}')
            )
