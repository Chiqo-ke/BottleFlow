# BottleFlow API Testing Guide

This guide provides comprehensive examples for testing all BottleFlow API endpoints using tools like Postman, curl, or any HTTP client.

## Base URL
```
http://localhost:8000
```

## Authentication

### 1. Login
**Endpoint:** `POST /api/auth/login/`

**Request Body:**
```json
{
    "username": "admin",
    "password": "your_password"
}
```

**Response:**
```json
{
    "user": {
        "id": "user-uuid",
        "username": "admin",
        "role": "admin",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
    },
    "tokens": {
        "refresh": "refresh_token_here",
        "access": "access_token_here"
    }
}
```

### 2. Get Current User
**Endpoint:** `GET /api/auth/me/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Products API

### 1. List Products
**Endpoint:** `GET /api/products/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 2. Create Product (Admin Only)
**Endpoint:** `POST /api/products/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "500ml Plastic Bottle",
    "purchase_price": "5.00",
    "wash_price": "2.00"
}
```
> **Note:** Price fields (`purchase_price`, `wash_price`) should be sent as strings representing valid numbers. Empty strings or non-numeric values will be rejected.

### 3. Update Product
**Endpoint:** `PUT /api/products/{product_id}/`

**Request Body:**
```json
{
    "name": "500ml Plastic Bottle - Updated",
    "purchase_price": "5.50",
    "wash_price": "2.50"
}
```

## Workers API

### 1. List Workers
**Endpoint:** `GET /api/workers/`

### 2. Create Worker (Admin Only)
**Endpoint:** `POST /api/workers/`

**Request Body:**
```json
{
    "name": "John Doe",
    "phone_number": "+254700000001",
    "id_number": "12345678",
    "role": "Washer",
    "is_active": true
}
```

### 3. Update Worker
**Endpoint:** `PUT /api/workers/{worker_id}/`

**Request Body:**
```json
{
    "name": "John Doe Updated",
    "phone_number": "+254700000002",
    "role": "Supervisor"
}
```

## Purchases API

### 1. List Purchases
**Endpoint:** `GET /api/purchases/`

**Query Parameters:**
- `summary=true` - Get summary view

### 2. Create Purchase
**Endpoint:** `POST /api/purchases/`

**Request Body:**
```json
{
    "date": "2024-01-15",
    "amount_paid": "1000.00",
    "notes": "Monthly inventory purchase",
    "items": [
        {
            "product": "product-uuid-1",
            "quantity": 100,
            "cost": "500.00"
        },
        {
            "product": "product-uuid-2",
            "quantity": 50,
            "cost": "500.00"
        }
    ]
}
```

### 3. Update Purchase Payment
**Endpoint:** `PUT /api/purchases/{purchase_id}/`

**Request Body:**
```json
{
    "amount_paid": "1200.00",
    "notes": "Additional payment made"
}
```

## Tasks API

### 1. List Tasks
**Endpoint:** `GET /api/tasks/`

**Query Parameters:**
- `worker_id=uuid` - Filter by worker
- `status=Pending|In Progress|Completed` - Filter by status
- `task_type=washing|daily_salary` - Filter by type
- `summary=true` - Get summary view

### 2. Create Washing Task
**Endpoint:** `POST /api/tasks/`

**Request Body:**
```json
{
    "worker": "worker-uuid",
    "product": "product-uuid",
    "task_type": "washing",
    "assigned_quantity": 100,
    "salary": "200.00",
    "deduction": "10.00",
    "date": "2024-01-15",
    "notes": "Regular washing task"
}
```

### 3. Create Daily Salary Task
**Endpoint:** `POST /api/tasks/daily-salary/`

**Request Body:**
```json
{
    "worker": "worker-uuid",
    "salary": "500.00",
    "deduction": "50.00",
    "date": "2024-01-15",
    "notes": "Daily salary for supervisor"
}
```

### 4. Update Task Progress
**Endpoint:** `PUT /api/tasks/{task_id}/`

**Request Body:**
```json
{
    "washed_quantity": 85,
    "notes": "Good progress, 85 bottles completed"
}
```

### 5. Get Worker Tasks
**Endpoint:** `GET /api/tasks/worker/{worker_id}/`

**Query Parameters:**
- `start_date=2024-01-01` - Filter from date
- `end_date=2024-01-31` - Filter to date

### 6. Get Task Statistics
**Endpoint:** `GET /api/tasks/statistics/`

## Stock API

### 1. Stock Overview
**Endpoint:** `GET /api/stock/`

**Response:**
```json
[
    {
        "product_id": "product-uuid",
        "product_name": "500ml Bottle",
        "raw_stock": 150,
        "washed_stock": 75,
        "total_stock": 225,
        "purchase_price": "5.00",
        "wash_price": "2.00"
    }
]
```

### 2. Stock Movements
**Endpoint:** `GET /api/stock/movements/`

**Query Parameters:**
- `product_id=uuid` - Filter by product
- `type=purchase|sell_raw|sell_washed|assign_wash|complete_wash` - Filter by type

### 3. Record Stock Sale
**Endpoint:** `POST /api/stock/sell/`

**Request Body:**
```json
{
    "product": "product-uuid",
    "sale_type": "washed",
    "quantity": 50,
    "price_per_unit": "3.00",
    "customer_name": "ABC Restaurant",
    "date": "2024-01-15",
    "notes": "Regular customer order"
}
```

### 4. Product Stock Details
**Endpoint:** `GET /api/stock/{product_id}/`

## Salaries API

### 1. Pending Salaries
**Endpoint:** `GET /api/salaries/pending/`

**Query Parameters:**
- `include_zero=true` - Include workers with zero pending salary

**Response:**
```json
[
    {
        "worker_id": "worker-uuid",
        "worker_name": "John Doe",
        "worker_role": "Washer",
        "pending_salary": "450.00",
        "total_earned": "1200.00",
        "total_paid": "750.00",
        "last_payment_date": "2024-01-10"
    }
]
```

### 2. List Salary Payments
**Endpoint:** `GET /api/salaries/payments/`

**Query Parameters:**
- `worker_id=uuid` - Filter by worker
- `start_date=2024-01-01` - Filter from date
- `end_date=2024-01-31` - Filter to date

### 3. Create Salary Payment
**Endpoint:** `POST /api/salaries/payments/`

**Request Body:**
```json
{
    "worker": "worker-uuid",
    "amount": "300.00",
    "date": "2024-01-15",
    "payment_method": "Cash",
    "notes": "Partial salary payment"
}
```

### 4. Worker Salary History
**Endpoint:** `GET /api/salaries/worker/{worker_id}/`

### 5. Salary Summary
**Endpoint:** `GET /api/salaries/summary/`

## Audit API (Admin Only)

### 1. Audit Logs
**Endpoint:** `GET /api/audit/`

**Query Parameters:**
- `user_id=uuid` - Filter by user
- `action=CREATE_PRODUCT|UPDATE_TASK|etc` - Filter by action
- `start_date=2024-01-01` - Filter from date
- `end_date=2024-01-31` - Filter to date
- `summary=true` - Get summary view

### 2. Audit Statistics
**Endpoint:** `GET /api/audit/statistics/`

## Error Responses

### Authentication Error (401)
```json
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid",
    "messages": [
        {
            "token_class": "AccessToken",
            "token_type": "access",
            "message": "Token is invalid or expired"
        }
    ]
}
```

### Permission Error (403)
```json
{
    "error": "Permission denied"
}
```

### Validation Error (400)
```json
{
    "field_name": [
        "This field is required."
    ],
    "another_field": [
        "Ensure this value is greater than 0."
    ]
}
```

### Not Found Error (404)
```json
{
    "detail": "Not found."
}
```

## Testing Workflow

### 1. Complete Purchase-to-Sale Flow
```bash
# 1. Login
POST /api/auth/login/

# 2. Create products
POST /api/products/

# 3. Create workers
POST /api/workers/

# 4. Record purchase
POST /api/purchases/

# 5. Assign washing task
POST /api/tasks/

# 6. Update task progress
PUT /api/tasks/{task_id}/

# 7. Check stock levels
GET /api/stock/

# 8. Record stock sale
POST /api/stock/sell/

# 9. Check pending salaries
GET /api/salaries/pending/

# 10. Pay worker salary
POST /api/salaries/payments/
```

### 2. Postman Collection
Import the following environment variables in Postman:
- `base_url`: `http://localhost:8000`
- `access_token`: `YOUR_ACCESS_TOKEN_HERE`

### 3. Automated Testing
Use the provided test data in the setup script to create a realistic testing environment.

## Rate Limiting
Currently, no rate limiting is implemented. For production, consider adding rate limiting middleware.

## Pagination
Most list endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

Example:
```
GET /api/products/?page=2&page_size=10
```
