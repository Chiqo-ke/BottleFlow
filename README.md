<!-- omit in toc -->
# BottleFlow 🍾

BottleFlow is a comprehensive bottle washing management system designed to streamline inventory, task management, and payroll for businesses in the bottle refurbishment industry.

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Running the Application](#running-the-application)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
- [Testing the Application](#testing-the-application)
  - [Backend Unit Tests](#backend-unit-tests)
  - [API Testing with Postman](#api-testing-with-postman)
  - [Manual API Testing](#manual-api-testing)
- [Usage](#usage)
  - [Creating an Admin User](#creating-an-admin-user)
  - [Creating a Manager User](#creating-a-manager-user)
- [Configuration](#configuration)
- [License](#license)

## Overview

This application provides a robust solution for managing the entire lifecycle of bottle washing and sales. It includes role-based access for Admins and Managers, detailed tracking of inventory, worker assignments, and automated salary calculations.

## Features

- **User Management**: Role-based authentication for Admins and Managers.
- **Product Management**: Track different bottle types with individual pricing.
- **Worker Management**: Manage employees and assign roles (e.g., Washer, Sorter, Manager).
- **Purchase & Stock Tracking**: Record inventory purchases and track real-time stock levels (raw, washed).
- **Task Management**: Assign washing tasks to workers and monitor their progress.
- **Automated Salary Calculation**: Automatically calculate worker salaries based on completed tasks.
- **Reporting & Audit**: View dashboards with key metrics and maintain a complete audit trail of system actions.

## Technology Stack

| Area     | Technology                                       |
|----------|--------------------------------------------------|
| **Backend**  | Django, Django REST Framework, JWT, PostgreSQL |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS         |
| **Database** | SQLite3 (development), PostgreSQL (production)   |

## Project Structure

The project is a monorepo containing two main packages:

- `backend/`: The Django REST API that powers the application.
- `studio-main/`: The Next.js frontend application.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- Python 3.8+
- Node.js v18+ and npm

### 1. Backend Setup

The backend includes an interactive setup script to automate configuration.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the automated setup script
python setup.py
```

The setup script will:
1. Create a `.env` file with a secure `SECRET_KEY`.
2. Set up the SQLite database and run migrations.
3. Prompt you to create a superuser (admin) account.

For detailed email setup instructions, see `backend/EMAIL_SETUP_GUIDE.md`.

### 2. Frontend Setup

The frontend is a Next.js application.

```bash
# Navigate to the frontend directory
cd studio-main

# Install dependencies
npm install

# Create a local environment file from the example
cp .env.example .env.local
```

Ensure the `NEXT_PUBLIC_API_URL` in `.env.local` points to your running backend (default is `http://localhost:8000`).

```.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Application

### Running the Backend

```bash
cd backend
source venv/bin/activate  # Or venv\Scripts\activate on Windows
python manage.py runserver
```
The backend API will be available at `http://localhost:8000`.

### Running the Frontend

```bash
cd studio-main
npm run dev
```
The frontend application will be available at `http://localhost:9002` (or the port you configured).

## Testing the Application

### Backend Unit Tests

Run the Django test suite to ensure all backend models and services are working correctly.

```bash
cd backend
python manage.py test
```

### API Testing with Postman

A Postman collection is provided for comprehensive API testing. See the guide at `backend/postman/README.md` for instructions on importing the collection and environment.

### Manual API Testing

For `curl` examples and detailed payload/response formats for every endpoint, refer to the `backend/API_TESTING_GUIDE.md`.

## Usage

### Creating an Admin User
If you skipped superuser creation during setup, you can create one anytime:
```bash
cd backend
python create_users.py
# Choose option 1
```

### Creating a Manager User
Manager accounts are not created manually. They are generated automatically when an admin adds a worker with the "manager" role and a valid email address via the frontend application. The system will then email the login credentials to the new manager.

For more details, see `MANAGER_ACCOUNTS.md`.

## Configuration

- **Backend**: Configuration is managed via the `.env` file in the `backend/` directory. This includes `SECRET_KEY`, `DATABASE_URL`, and `EMAIL_*` settings.
- **Frontend**: Configuration is managed via the `.env.local` file in the `studio-main/` directory. This includes API URLs and other UI-related settings. See `studio-main/CONFIGURATION.md` for all options.

## License

This project is licensed under the MIT License.