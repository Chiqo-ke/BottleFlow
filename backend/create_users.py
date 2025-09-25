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

def create_user_with_role():
    """Interactive user creation with role selection"""
    print("🚀 BottleFlow User Creation")
    print("=" * 30)
    
    # Get user details
    username = input("Username: ").strip()
    
    # Check if user exists
    if User.objects.filter(username=username).exists():
        print(f"❌ User '{username}' already exists!")
        return False
    
    email = input("Email: ").strip()
    
    # Role selection
    print("\nAvailable roles:")
    print("  1. admin   - Full system access (can create users, access all endpoints)")
    print("  2. manager - Limited access (can manage operations but not create users)")
    
    while True:
        role_choice = input("\nSelect role (admin/manager): ").strip().lower()
        if role_choice in ['admin', 'manager']:
            role = role_choice
            break
        else:
            print("Please enter 'admin' or 'manager'")
    
    # Password
    password = getpass.getpass("Password: ")
    password_confirm = getpass.getpass("Confirm password: ")
    
    if password != password_confirm:
        print("❌ Passwords do not match!")
        return False
    
    # Create user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role
        )
        
        # Set permissions based on role
        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"✅ Admin user '{username}' created successfully!")
            print("   - Can access Django admin panel")
            print("   - Can create other users")
            print("   - Has full API access")
        else:
            print(f"✅ Manager user '{username}' created successfully!")
            print("   - Can manage daily operations")
            print("   - Cannot create users")
            print("   - Has limited API access")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return False

def create_sample_users():
    """Create sample admin and manager users"""
    print("🎯 Creating sample users...")
    
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
    
    # Sample manager
    if not User.objects.filter(username='manager').exists():
        User.objects.create_user(
            username='manager',
            email='manager@bottleflow.com',
            password='manager123',
            role='manager'
        )
        print("✅ Sample manager created: manager/manager123")

def main():
    """Main function"""
    print("Choose an option:")
    print("1. Create user interactively")
    print("2. Create sample users (admin/admin123, manager/manager123)")
    print("3. List existing users")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == '1':
        create_user_with_role()
    elif choice == '2':
        create_sample_users()
    elif choice == '3':
        print("\n📋 Existing users:")
        for user in User.objects.all():
            print(f"   {user.username} ({user.role}) - {user.email}")
    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()
