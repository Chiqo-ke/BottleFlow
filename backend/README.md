# BottleFlow Backend

A Django REST API backend for the BottleFlow bottle washing management system.

## Features

- **User Management**: Role-based authentication (Admin/Manager)
- **Product Management**: Track different bottle types with pricing
- **Worker Management**: Manage employees with role assignments
- **Purchase Tracking**: Record inventory purchases with detailed items
- **Task Management**: Assign washing tasks and track progress
- **Stock Management**: Real-time inventory tracking with movements
- **Salary Management**: Track worker payments and pending salaries
- **Audit Trail**: Complete logging of all system actions

## Technology Stack

- **Framework**: Django 4.2.7 with Django REST Framework
- **Database**: SQLite3 (development) / PostgreSQL (production recommended)
- **Authentication**: JWT tokens with SimpleJWT
- **API Documentation**: RESTful API with comprehensive endpoints

## Quick Start

### Prerequisites

- Python 3.8+
- pip package manager

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   # Copy example environment file
   copy .env.example .env
   # Edit .env file with your configuration
   ```

5. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user info
- `POST /api/auth/create-user/` - Create new user (Admin only)

### Products
- `GET /api/products/` - List all products
- `POST /api/products/` - Create product (Admin only)
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product (Admin only)
- `DELETE /api/products/{id}/` - Delete product (Admin only)

### Workers
- `GET /api/workers/` - List all workers
- `POST /api/workers/` - Create worker (Admin only)
- `GET /api/workers/{id}/` - Get worker details
- `PUT /api/workers/{id}/` - Update worker (Admin only)
- `DELETE /api/workers/{id}/` - Deactivate worker (Admin only)

### Purchases
- `GET /api/purchases/` - List all purchases
- `POST /api/purchases/` - Create purchase
- `GET /api/purchases/{id}/` - Get purchase details
- `PUT /api/purchases/{id}/` - Update purchase

### Tasks
- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `POST /api/tasks/daily-salary/` - Create daily salary task
- `GET /api/tasks/worker/{worker_id}/` - Get worker tasks
- `GET /api/tasks/statistics/` - Get task statistics

### Stock
- `GET /api/stock/` - Stock overview
- `GET /api/stock/movements/` - Stock movement history
- `GET /api/stock/sales/` - Stock sales history
- `POST /api/stock/sell/` - Record stock sale
- `GET /api/stock/{product_id}/` - Product stock details

### Salaries
- `GET /api/salaries/pending/` - Pending salaries
- `GET /api/salaries/payments/` - Salary payments
- `POST /api/salaries/payments/` - Create salary payment
- `GET /api/salaries/worker/{worker_id}/` - Worker salary history
- `GET /api/salaries/summary/` - Salary summary

### Audit
- `GET /api/audit/` - Audit logs (Admin only)
- `GET /api/audit/statistics/` - Audit statistics (Admin only)

## Database Schema

### Core Models

1. **User** - Custom user model with role-based access
2. **Product** - Bottle types with pricing information
3. **Worker** - Employee management with roles
4. **Purchase** - Inventory purchase records
5. **PurchaseItem** - Individual items in purchases
6. **Task** - Worker task assignments
7. **StockMovement** - Inventory movement tracking
8. **StockSale** - Stock sales records
9. **SalaryPayment** - Worker payment records
10. **AuditLog** - System action logging

## Security Features

- JWT-based authentication
- Role-based access control (Admin/Manager)
- CORS configuration for frontend integration
- Comprehensive audit logging
- Input validation and sanitization

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Admin Interface
Access the Django admin at `http://localhost:8000/admin/`

## Production Deployment

1. **Environment Variables**
   - Set `DEBUG=False`
   - Configure proper `SECRET_KEY`
   - Set up production database (PostgreSQL recommended)
   - Configure email settings

2. **Security Settings**
   - Enable HTTPS
   - Configure security headers
   - Set up proper CORS origins
   - Configure static file serving

3. **Database**
   - Use PostgreSQL or MySQL for production
   - Set up regular backups
   - Configure connection pooling

## API Usage Examples

### Authentication
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/products/
```

### Creating a Product
```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "500ml Bottle", "purchase_price": "5.00", "wash_price": "2.00"}'
```

### Recording a Purchase
```bash
curl -X POST http://localhost:8000/api/purchases/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "amount_paid": "1000.00",
    "notes": "Monthly inventory purchase",
    "items": [
      {"product": "product-uuid", "quantity": 100, "cost": "500.00"},
      {"product": "product-uuid-2", "quantity": 50, "cost": "500.00"}
    ]
  }'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository.
