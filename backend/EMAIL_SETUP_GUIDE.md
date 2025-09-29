# Email Setup Guide for BottleFlow

This guide explains how to configure email sending for manager account creation in BottleFlow.

## Overview

When an admin creates a worker with the role "Manager" and provides an email address, the system will:
1. Create a user account with login credentials
2. Send the credentials via email to the manager
3. Log the action in the audit trail

## Email Configuration Options

### Option 1: Development Mode (Console Backend)
For development and testing, emails are printed to the console instead of being sent.

**Configuration:**
```bash
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

**What happens:**
- Manager accounts are created successfully
- Email content is printed to the Django console
- No actual email is sent
- Perfect for development and testing

### Option 2: Production Mode (SMTP Backend)
For production, emails are sent via SMTP to real email addresses.

**Configuration:**
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@bottleflow.com
```

## Setting Up Gmail SMTP (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to Google Account > Security > 2-Step Verification
2. Scroll down to "App passwords"
3. Generate a new app password for "Mail"
4. Copy the 16-character password (remove spaces)

### Step 3: Configure Environment Variables
Create a `.env` file in the backend directory:

```bash
# Email Configuration for Production
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
DEFAULT_FROM_EMAIL=noreply@bottleflow.com
```

## Alternative SMTP Providers

### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

### Yahoo Mail
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

### Custom SMTP Server
```bash
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-username
EMAIL_HOST_PASSWORD=your-password
```

## Testing Email Configuration

### Method 1: Create a Manager Worker
1. Start the Django server: `python manage.py runserver`
2. Use the API to create a manager worker with an email
3. Check the console output for email status

### Method 2: Django Shell Test
```python
python manage.py shell

from django.core.mail import send_mail
from django.conf import settings

# Test email sending
send_mail(
    'Test Email',
    'This is a test email from BottleFlow.',
    settings.DEFAULT_FROM_EMAIL,
    ['test@example.com'],
    fail_silently=False,
)
```

## Troubleshooting

### Console Shows Email Content
**Issue:** Emails are printed to console instead of being sent.
**Solution:** Change `EMAIL_BACKEND` to `django.core.mail.backends.smtp.EmailBackend`

### "Email credentials not configured" Error
**Issue:** `EMAIL_HOST_USER` or `EMAIL_HOST_PASSWORD` not set.
**Solution:** Set both environment variables with valid credentials.

### "Authentication failed" Error
**Issue:** Invalid email credentials.
**Solutions:**
- Verify email and password are correct
- For Gmail: Use app password instead of regular password
- Enable "Less secure app access" (not recommended)

### "Connection refused" Error
**Issue:** Cannot connect to SMTP server.
**Solutions:**
- Check `EMAIL_HOST` and `EMAIL_PORT` settings
- Verify internet connection
- Check firewall settings

### "SSL/TLS" Errors
**Issue:** SSL/TLS configuration problems.
**Solutions:**
- Set `EMAIL_USE_TLS=True` for port 587
- Set `EMAIL_USE_SSL=True` for port 465
- Don't use both TLS and SSL simultaneously

## Email Template Customization

The email template is defined in `workers/email_service.py`. You can customize:

- Subject line
- Message content
- Sender information
- Frontend URL

## Security Considerations

1. **Never commit credentials:** Use environment variables, not hardcoded values
2. **Use app passwords:** For Gmail, use app-specific passwords
3. **Secure SMTP:** Always use TLS/SSL encryption
4. **Rotate passwords:** Regularly update email credentials
5. **Monitor usage:** Keep track of email sending for abuse detection

## Production Checklist

- [ ] Set `EMAIL_BACKEND` to SMTP backend
- [ ] Configure valid SMTP credentials
- [ ] Test email sending functionality
- [ ] Set up proper `DEFAULT_FROM_EMAIL`
- [ ] Configure `FRONTEND_URL` for email links
- [ ] Enable email logging for monitoring
- [ ] Set up email rate limiting if needed

## Monitoring and Logging

The system provides detailed logging for email operations:

- ✅ Success messages with green checkmarks
- ❌ Error messages with red X marks
- 📧 Email configuration status on startup
- 🔄 Process status during manager creation

Check the Django console output for real-time email status updates.

## API Response Format

When creating a manager worker, the API response includes:

```json
{
  "id": "worker-id",
  "name": "Manager Name",
  "email": "manager@example.com",
  "role": "manager",
  "account_created": true,
  "email_sent": true,
  "username": "generated-username",
  "message": "Manager John Doe created successfully. Email sent."
}
```

## Common Use Cases

### Development Setup
```bash
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```
- Emails printed to console
- No real emails sent
- Perfect for testing

### Production Setup
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST_USER=bottleflow@company.com
EMAIL_HOST_PASSWORD=secure-app-password
```
- Real emails sent to managers
- Proper authentication required
- Monitor for delivery issues

### Staging/Testing Setup
```bash
EMAIL_BACKEND=django.core.mail.backends.filebased.EmailBackend
EMAIL_FILE_PATH=/tmp/app-messages
```
- Emails saved to files
- No real emails sent
- Good for integration testing

## Support

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify environment variables are set correctly
3. Test with a simple email first
4. Check SMTP provider documentation
5. Review Django email documentation

The improved email service now provides comprehensive logging and error handling to help diagnose any issues quickly.
