#!/usr/bin/env python3
"""
Fix migration issues by resetting database and creating proper migrations
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def main():
    """Fix migration issues"""
    print("🔧 Fixing BottleFlow migration issues...")
    
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bottleflow.settings')
    django.setup()
    
    print("\n1. Removing existing database...")
    if os.path.exists('db.sqlite3'):
        os.remove('db.sqlite3')
        print("✅ Database removed")
    else:
        print("ℹ️  No existing database found")
    
    print("\n2. Creating migrations for all apps...")
    apps = ['authentication', 'products', 'workers', 'purchases', 'tasks', 'stock', 'salaries', 'audit']
    
    for app in apps:
        print(f"   Creating migrations for {app}...")
        try:
            execute_from_command_line(['manage.py', 'makemigrations', app])
            print(f"   ✅ {app} migrations created")
        except Exception as e:
            print(f"   ⚠️  {app} migrations: {e}")
    
    print("\n3. Applying all migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ All migrations applied successfully")
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False
    
    print("\n🎉 Migration fix completed!")
    print("\nNext steps:")
    print("1. Create a superuser: python manage.py createsuperuser")
    print("2. Start the server: python manage.py runserver")
    print("3. Test the API endpoints")
    
    return True

if __name__ == "__main__":
    main()
