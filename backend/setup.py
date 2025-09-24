#!/usr/bin/env python3
"""
Setup script for BottleFlow Backend
Automates initial setup and configuration
"""

import os
import secrets
import django
from django.core.management import execute_from_command_line

def generate_secret_key():
    """Generate a secure Django secret key"""
    return secrets.token_urlsafe(50)

def create_env_file():
    """Create .env file with secure defaults"""
    env_content = f"""# Django Configuration
SECRET_KEY={generate_secret_key()}
DEBUG=True

# Database Configuration
DATABASE_URL=sqlite:///db.sqlite3

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=

# Security Settings
SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=0
SECURE_HSTS_INCLUDE_SUBDOMAINS=False
SECURE_HSTS_PRELOAD=False
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file with secure configuration")

def setup_database():
    """Setup database with migrations"""
    print("🔄 Setting up database...")
    
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bottleflow.settings')
    django.setup()
    
    # Run migrations
    execute_from_command_line(['manage.py', 'makemigrations'])
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("✅ Database setup completed")

def create_superuser():
    """Create superuser account"""
    print("\n👤 Creating superuser account...")
    print("Please provide the following information:")
    
    username = input("Username: ").strip()
    email = input("Email: ").strip()
    
    if username and email:
        try:
            execute_from_command_line([
                'manage.py', 'createsuperuser', 
                '--username', username,
                '--email', email
            ])
            print("✅ Superuser created successfully")
        except Exception as e:
            print(f"❌ Error creating superuser: {e}")
    else:
        print("⚠️  Skipping superuser creation")

def create_sample_data():
    """Create sample data for testing"""
    print("\n📊 Would you like to create sample data for testing? (y/n): ", end="")
    choice = input().strip().lower()
    
    if choice == 'y':
        try:
            # Import here to avoid issues if Django isn't set up yet
            from django.contrib.auth import get_user_model
            from products.models import Product
            from workers.models import Worker
            
            User = get_user_model()
            
            # Create sample products
            products_data = [
                {"name": "500ml Plastic Bottle", "purchase_price": "5.00", "wash_price": "2.00"},
                {"name": "1L Plastic Bottle", "purchase_price": "8.00", "wash_price": "3.00"},
                {"name": "Glass Bottle 330ml", "purchase_price": "12.00", "wash_price": "4.00"},
            ]
            
            for product_data in products_data:
                Product.objects.get_or_create(
                    name=product_data["name"],
                    defaults=product_data
                )
            
            # Create sample workers
            workers_data = [
                {"name": "John Doe", "phone_number": "+254700000001", "id_number": "12345678", "role": "Washer"},
                {"name": "Jane Smith", "phone_number": "+254700000002", "id_number": "87654321", "role": "Sorter"},
                {"name": "Mike Johnson", "phone_number": "+254700000003", "id_number": "11223344", "role": "Supervisor"},
            ]
            
            for worker_data in workers_data:
                Worker.objects.get_or_create(
                    id_number=worker_data["id_number"],
                    defaults=worker_data
                )
            
            print("✅ Sample data created successfully")
            
        except Exception as e:
            print(f"❌ Error creating sample data: {e}")
    else:
        print("⚠️  Skipping sample data creation")

def main():
    """Main setup function"""
    print("🚀 BottleFlow Backend Setup")
    print("=" * 30)
    
    # Check if .env exists
    if not os.path.exists('.env'):
        create_env_file()
    else:
        print("⚠️  .env file already exists, skipping creation")
    
    # Setup database
    setup_database()
    
    # Create superuser
    create_superuser()
    
    # Create sample data
    create_sample_data()
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the development server: python manage.py runserver")
    print("2. Access the API at: http://localhost:8000/")
    print("3. Access the admin panel at: http://localhost:8000/admin/")
    print("4. Check the README.md for API documentation")

if __name__ == "__main__":
    main()
