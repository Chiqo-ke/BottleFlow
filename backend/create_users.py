#!/usr/bin/env python3
"""
Quick script to create admin and manager users for BottleFlow
"""

import os
import django
import getpass

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bottleflow.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin_user():
    """Interactive admin user creation (superuser only)"""
    print("🚀 BottleFlow Admin User Creation")
    print("=" * 35)
    print("ℹ️  This script creates admin superusers only.")
    print("ℹ️  Manager accounts are created automatically when adding manager workers.")
    print()
    
    # Get user details
    username = input("Admin Username: ").strip()
    
    # Check if user exists
    if User.objects.filter(username=username).exists():
        print(f"❌ User '{username}' already exists!")
        return False
    
    email = input("Admin Email: ").strip()
    
    # Password
    password = getpass.getpass("Password: ")
    password_confirm = getpass.getpass("Confirm password: ")
    
    if password != password_confirm:
        print("❌ Passwords do not match!")
        return False
    
    # Create admin user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='admin'
        )
        
        # Set superuser permissions
        user.is_staff = True
        user.is_superuser = True
        user.save()
        
        print(f"✅ Admin user '{username}' created successfully!")
        print("   - Can access Django admin panel")
        print("   - Can create workers and manager accounts")
        print("   - Has full API access")
        print()
        print("💡 To create manager accounts:")
        print("   1. Login to the frontend as admin")
        print("   2. Go to Workers section")
        print("   3. Add worker with 'manager' role and email")
        print("   4. Manager account will be created automatically")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

def create_sample_admin():
    """Create sample admin user only"""
    print("🎯 Creating sample admin user...")
    
    # Sample admin
    if not User.objects.filter(username='admin').exists():
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@bottleflow.com',
            password='admin123',
            role='admin'
        )
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print("✅ Sample admin created: admin/admin123")
        print()
        print("💡 Manager accounts are created automatically when:")
        print("   - Admin adds a worker with 'manager' role and email")
        print("   - Credentials are sent via email to the manager")
    else:
        print("ℹ️  Sample admin already exists")

def main():
    """Main function"""
    print("Choose an option:")
    print("1. Create admin user interactively")
    print("2. Create sample admin user (admin/admin123)")
    print("3. List existing users")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == '1':
        create_admin_user()
    elif choice == '2':
        create_sample_admin()
    elif choice == '3':
        print("\n📋 Existing users:")
        for user in User.objects.all():
            role_display = f"{user.role} {'(superuser)' if user.is_superuser else ''}"
            print(f"   {user.username} ({role_display}) - {user.email}")
    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()
