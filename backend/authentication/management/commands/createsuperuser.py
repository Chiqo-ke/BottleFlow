from django.contrib.auth.management.commands.createsuperuser import Command as BaseCommand
from django.contrib.auth import get_user_model
from django.core.management import CommandError
import sys

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with role selection (admin or manager)'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add role field to the required fields
        self.UserModel._meta.get_field('role').blank = False

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            '--role',
            choices=['admin', 'manager'],
            help='Role for the superuser (admin or manager). Default is admin.',
        )

    def handle(self, *args, **options):
        # Set default role to admin for superuser
        if not options.get('role'):
            if options.get('interactive', True):
                # Interactive mode - ask for role
                self.stdout.write("🚀 BottleFlow Superuser Creation")
                self.stdout.write("=" * 35)
                self.stdout.write("")
                self.stdout.write("Available roles:")
                self.stdout.write("  admin   - Full system access (recommended for superuser)")
                self.stdout.write("  manager - Limited management access")
                self.stdout.write("")
                
                while True:
                    role = input("Role (admin/manager) [admin]: ").strip().lower()
                    if not role:
                        role = 'admin'  # Default to admin
                    
                    if role in ['admin', 'manager']:
                        options['role'] = role
                        break
                    else:
                        self.stderr.write("Please enter 'admin' or 'manager'")
            else:
                # Non-interactive mode - default to admin
                options['role'] = 'admin'

        # Store the role for later use
        self._role = options['role']
        
        # Call the parent handle method
        try:
            super().handle(*args, **options)
        except KeyboardInterrupt:
            self.stderr.write("\nOperation cancelled.")
            sys.exit(1)

    def get_input_data(self, field, message, default=None):
        """Override to handle role field specially"""
        if field.name == 'role':
            return self._role
        return super().get_input_data(field, message, default)

    def _get_input_message(self, field, default=None):
        """Override to customize role field message"""
        if field.name == 'role':
            return f"Role ({'/'.join([choice[0] for choice in field.choices])})"
        return super()._get_input_message(field, default)

    def execute(self, *args, **options):
        """Override to show success message with role info"""
        result = super().execute(*args, **options)
        
        # Show success message with role information
        if not options.get('verbosity', 1) == 0:
            role = options.get('role', 'admin')
            username = options.get('username', 'superuser')
            
            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS(f"✅ Superuser '{username}' created successfully!"))
            self.stdout.write(f"   Role: {role.title()}")
            
            if role == 'admin':
                self.stdout.write("   - Full system access")
                self.stdout.write("   - Can access Django admin panel")
                self.stdout.write("   - Can create other users")
                self.stdout.write("   - Access to all API endpoints")
            else:
                self.stdout.write("   - Management access")
                self.stdout.write("   - Limited API access")
                self.stdout.write("   - Cannot create users")
            
            self.stdout.write("")
            self.stdout.write("Next steps:")
            self.stdout.write("1. Start the server: python manage.py runserver")
            self.stdout.write("2. Login at: http://localhost:8000/api/auth/login/")
            if role == 'admin':
                self.stdout.write("3. Access admin panel: http://localhost:8000/admin/")
        
        return result
