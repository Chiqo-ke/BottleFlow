# BottleFlow Frontend Configuration Guide

This document outlines the configuration options available for the BottleFlow frontend application.

## Environment Variables

The application uses environment variables to make it configurable without hardcoding values. Create a `.env.local` file in the root directory based on the `env.example` file.

### Required Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=BottleFlow
NEXT_PUBLIC_COMPANY_DOMAIN=bottleflow.com

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=admin@bottleflow.com

# UI Configuration
NEXT_PUBLIC_DEFAULT_AVATAR_URL=https://ui-avatars.com/api/?name={name}&background=random

# Development Configuration
NEXT_PUBLIC_DEV_PORT=9002
```

### Configuration Options

#### API Configuration
- `NEXT_PUBLIC_API_URL`: The base URL for the backend API
  - Default: `http://localhost:8000`
  - Production example: `https://api.bottleflow.com`

#### App Configuration
- `NEXT_PUBLIC_APP_NAME`: The name of your application
  - Default: `BottleFlow`
  - Used in: Page titles, navigation header, metadata

- `NEXT_PUBLIC_COMPANY_DOMAIN`: Your company's domain name
  - Default: `bottleflow.com`
  - Used in: User email display format (`admin@{domain}`)

#### Admin Configuration
- `NEXT_PUBLIC_ADMIN_EMAIL`: Admin email for notifications
  - Default: `admin@bottleflow.com`
  - Used for: System notifications and admin communications

#### UI Configuration
- `NEXT_PUBLIC_DEFAULT_AVATAR_URL`: Template URL for user avatars
  - Default: `https://ui-avatars.com/api/?name={name}&background=random`
  - The `{name}` placeholder will be replaced with the user's role
  - Alternative services: Gravatar, custom avatar service

#### Development Configuration
- `NEXT_PUBLIC_DEV_PORT`: Port number for development server
  - Default: `9002`
  - Used in: `npm run dev` script

## Changes Made

### Removed Hardcoded Values

1. **Phone Number Verification**: Completely removed the verification code feature when adding new workers
   - Removed verification dialog and related state management
   - Simplified worker creation flow
   - Removed dependency on AI verification service

2. **API Configuration**: Moved hardcoded API URL to environment variable
   - Created `APP_CONFIG` object in `lib/api.ts`
   - All API calls now use configurable base URL

3. **UI Elements**: Made UI elements configurable
   - App name in navigation and metadata
   - Company domain in user email display
   - Avatar URLs using configurable service

4. **Development Settings**: Made development port configurable
   - Package.json now uses environment variable for dev port

### Files Modified

- `src/components/dashboard/workers-client.tsx`: Removed verification code functionality
- `src/lib/api.ts`: Added APP_CONFIG with environment variables
- `src/app/dashboard/layout.tsx`: Updated to use configurable values
- `src/app/layout.tsx`: Updated metadata to use configurable app name
- `package.json`: Updated dev script to use configurable port
- `src/ai/dev.ts`: Removed import for deleted verification code file

### Files Removed

- `src/ai/flows/send-verification-code.ts`: Verification code functionality

## Setup Instructions

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update the values in `.env.local` according to your environment:
   ```bash
   # For production
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   NEXT_PUBLIC_APP_NAME=YourAppName
   NEXT_PUBLIC_COMPANY_DOMAIN=yourcompany.com
   NEXT_PUBLIC_ADMIN_EMAIL=admin@yourcompany.com
   ```

3. Install dependencies and run the development server:
   ```bash
   npm install
   npm run dev
   ```

## Benefits

- **Flexibility**: Easy to deploy to different environments without code changes
- **Security**: No hardcoded credentials or URLs in the codebase
- **Maintainability**: Centralized configuration management
- **Scalability**: Easy to add new configuration options as needed

## Best Practices

1. Always use `NEXT_PUBLIC_` prefix for client-side environment variables
2. Provide sensible defaults for all configuration options
3. Document all environment variables in this file
4. Never commit `.env.local` files to version control
5. Use the `env.example` file to document required variables
