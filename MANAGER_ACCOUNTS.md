# Manager Account Creation Feature

This document outlines the new manager account creation functionality in BottleFlow.

## Overview

When an admin adds a worker with the "manager" role, the system automatically:
1. Creates a user account for the manager
2. Generates secure login credentials
3. Sends the credentials via email to the manager
4. Links the user account to the worker record

## Features

### Frontend Changes

#### Worker Form Updates
- **Role Dropdown**: Added predefined roles (washer, sorter, manager, others)
- **Conditional Email Field**: Shows when "manager" role is selected
- **Email Validation**: Required for manager role
- **User Feedback**: Toast notifications for successful account creation

#### Form Validation
- Email is required when manager role is selected
- Email format validation
- Custom role support with "others" option

### Backend Changes

#### Worker Model Updates
- Added `email` field (optional, required for managers)
- Added `user_account` field (OneToOne relationship with User model)
- Updated serializers to handle email field

#### Manager Account Creation Service
- **Automatic Username Generation**: Based on email address
- **Secure Password Generation**: 12-character random password
- **Personalized Email Service**: Sends credentials from the admin user's email
- **Account Linking**: Associates user account with worker record

#### API Response Enhancements
- Returns account creation status
- Includes username and email sending status
- Provides error details if account creation fails

### User Creation Script Updates

#### Refactored `create_users.py`
- **Admin Only**: Script now creates only admin superusers
- **Manager Guidance**: Provides instructions for manager account creation
- **Sample Data**: Creates sample admin user only

## Usage

### Creating a Manager Worker

1. **Login as Admin**: Use admin credentials to access the system
2. **Navigate to Workers**: Go to the Workers section in the dashboard
3. **Add New Worker**: Click "Add Worker" button
4. **Select Manager Role**: Choose "Manager" from the role dropdown
5. **Enter Email**: Provide the manager's email address (required)
6. **Fill Other Details**: Complete name, phone, and ID number
7. **Submit**: Click "Add Worker" to create both worker record and user account

### Manager Login Process

1. **Receive Email**: Manager receives email with login credentials
2. **Access System**: Use provided username and password to login
3. **Manager Dashboard**: Access manager-specific features and permissions

## Technical Implementation

### Email Service (`workers/email_service.py`)

```python
def create_manager_account(name, email):
    """Create manager user account and return credentials"""
    
def send_manager_credentials_email(name, email, username, password, admin_user=None):
    """Send credentials via email from the admin user's email"""
```

#### Personalized Email Features
- **Admin Sender**: Emails are sent from the currently signed-in admin user's email
- **Personal Touch**: Email includes the admin's name and contact information
- **Fallback Support**: Uses `DEFAULT_FROM_EMAIL` if admin email is not available
- **Direct Contact**: Managers can reply directly to the admin who created their account

### Worker Creation Flow

1. **Form Submission**: Frontend validates and submits worker data
2. **Backend Processing**: 
   - Creates worker record
   - If manager role + email: creates user account
   - Sends credentials email
   - Links accounts
3. **Response**: Returns success status and account details
4. **Frontend Feedback**: Shows appropriate success message

### Database Schema

```sql
-- Worker model additions
ALTER TABLE workers ADD COLUMN email VARCHAR(254) NULL;
ALTER TABLE workers ADD COLUMN user_account_id UUID NULL;
ALTER TABLE workers ADD CONSTRAINT fk_user_account 
    FOREIGN KEY (user_account_id) REFERENCES users(id);
```

## Security Features

### Password Generation
- 12-character minimum length
- Includes letters, numbers, and special characters
- Cryptographically secure random generation

### Username Generation
- Based on email address
- Alphanumeric characters only
- Automatic uniqueness checking
- Incremental numbering for duplicates

### Account Linking
- OneToOne relationship between Worker and User
- SET_NULL on user deletion (preserves worker record)
- Proper foreign key constraints

## Error Handling

### Account Creation Failures
- Worker record is still created
- Error details logged and returned
- Admin notified of account creation failure
- Manual account creation possible

### Email Sending Failures
- Account is created successfully
- Email failure logged
- Admin can manually share credentials
- Account remains functional

## Configuration

### Email Settings
Required Django settings for email functionality:

```python
# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'your-smtp-server.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@domain.com'
EMAIL_HOST_PASSWORD = 'your-password'
DEFAULT_FROM_EMAIL = 'BottleFlow <noreply@bottleflow.com>'  # Fallback email
```

**Note**: The system will use the currently signed-in admin user's email as the sender when creating manager accounts. The `DEFAULT_FROM_EMAIL` serves as a fallback if the admin user doesn't have an email configured.

### Frontend Configuration
Environment variables for frontend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=BottleFlow
NEXT_PUBLIC_ADMIN_EMAIL=admin@bottleflow.com
```

## Migration Guide

### Database Migration
```bash
# Apply the new migration
python manage.py migrate workers 0002_add_email_and_user_account
```

### Existing Workers
- Existing workers are not affected
- Can be updated to add email and create accounts
- No data loss or breaking changes

## Testing

### Manual Testing Steps

1. **Create Admin User**:
   ```bash
   python create_users.py
   # Choose option 1 or 2 to create admin
   ```

2. **Test Manager Creation**:
   - Login as admin
   - Add worker with manager role and email
   - Verify account creation and email sending

3. **Test Manager Login**:
   - Use credentials from email
   - Verify manager can login
   - Check manager permissions

### API Testing
Use the provided API endpoints to test:
- `POST /api/workers/` - Create worker with manager role
- `GET /api/workers/` - List workers with account info
- `POST /api/auth/login/` - Test manager login

## Troubleshooting

### Common Issues

1. **Email Not Sent**:
   - Check email configuration
   - Verify SMTP settings
   - Check spam folder

2. **Account Creation Failed**:
   - Check user model constraints
   - Verify email uniqueness
   - Check database permissions

3. **Manager Can't Login**:
   - Verify account was created
   - Check username/password
   - Ensure account is active

### Logs and Debugging
- Check Django logs for account creation errors
- Audit trail logs all worker and account creation
- Email sending failures are logged

## Future Enhancements

### Planned Features
- Password reset functionality for managers
- Account activation via email link
- Bulk manager account creation
- Manager profile management
- Role-based permission refinement

### Considerations
- Multi-tenant support
- Advanced email templates
- Integration with external auth systems
- Mobile app support
