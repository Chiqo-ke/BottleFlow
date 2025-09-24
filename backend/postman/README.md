# BottleFlow Postman Collection

This directory contains Postman collection and environment files for testing the BottleFlow API.

## Files

1. **BottleFlow_API_Collection.json** - Complete API collection with all endpoints
2. **BottleFlow_Environment.json** - Environment variables for the collection

## Import Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `BottleFlow_API_Collection.json`
4. The collection will be imported with all endpoints organized by feature

### 2. Import Environment
1. Click the gear icon (⚙️) in the top right corner
2. Click "Import" 
3. Select `BottleFlow_Environment.json`
4. Select the "BottleFlow Environment" from the environment dropdown

## Setup

### 1. Start Backend Server
Make sure your Django backend is running:
```bash
cd backend
python manage.py runserver
```

### 2. Update Environment Variables
Before testing, update these environment variables in Postman:
- `username`: Your admin username (default: "admin")
- `password`: Your admin password (default: "admin123")
- `base_url`: Backend URL (default: "http://localhost:8000")

### 3. Login First
Always start by running the "Login" request in the Authentication folder. This will:
- Authenticate your user
- Automatically set the `access_token` in environment variables
- Set user information for subsequent requests

## Collection Structure

### 📁 Authentication
- **Login** - Get JWT tokens (run this first!)
- **Get Current User** - Verify authentication
- **Create User** - Create new users (Admin only)
- **Logout** - Invalidate tokens

### 📁 Products
- **List Products** - Get all products
- **Create Product** - Add new product (saves product_id)
- **Get Product Details** - View specific product
- **Update Product** - Modify product details
- **Delete Product** - Remove product

### 📁 Workers
- **List Workers** - Get all workers
- **Create Worker** - Add new worker (saves worker_id)
- **Get Worker Details** - View specific worker
- **Update Worker** - Modify worker details
- **Delete Worker** - Deactivate worker

### 📁 Purchases
- **List Purchases** - Get all purchases
- **List Purchases (Summary)** - Condensed view
- **Create Purchase** - Record new purchase (saves purchase_id)
- **Get Purchase Details** - View specific purchase
- **Update Purchase Payment** - Modify payment info

### 📁 Tasks
- **List Tasks** - Get all tasks
- **List Tasks (Summary)** - Condensed view
- **Create Washing Task** - Assign washing work (saves task_id)
- **Create Daily Salary Task** - Record daily salary
- **Get Task Details** - View specific task
- **Update Task Progress** - Update completion status
- **Get Worker Tasks** - Tasks for specific worker
- **Get Task Statistics** - Summary statistics

### 📁 Stock
- **Stock Overview** - Current inventory levels
- **Stock Movements** - Movement history
- **Stock Movements (Filtered)** - Filtered by product/type
- **Stock Sales** - Sales history
- **Record Stock Sale** - Record new sale
- **Product Stock Details** - Detailed product inventory

### 📁 Salaries
- **Pending Salaries** - Workers with pending payments
- **Pending Salaries (Include Zero)** - Include zero balances
- **List Salary Payments** - Payment history
- **Create Salary Payment** - Record new payment
- **Worker Salary History** - Specific worker payments
- **Salary Summary** - Payment statistics

### 📁 Audit (Admin Only)
- **Audit Logs** - System activity logs
- **Audit Logs (Summary)** - Condensed view
- **Audit Logs (Filtered)** - Filtered by criteria
- **Audit Statistics** - Audit summary stats

## Automatic Variable Setting

The collection includes scripts that automatically set environment variables:

- **Login** → Sets `access_token`, `refresh_token`, `user_id`, `user_role`
- **Create Product** → Sets `product_id`
- **Create Worker** → Sets `worker_id`
- **Create Purchase** → Sets `purchase_id`
- **Create Washing Task** → Sets `task_id`

## Testing Workflow

### Complete End-to-End Test
1. **Login** - Authenticate user
2. **Create Product** - Add bottle type
3. **Create Worker** - Add employee
4. **Create Purchase** - Record inventory purchase
5. **Stock Overview** - Verify stock levels
6. **Create Washing Task** - Assign work
7. **Update Task Progress** - Mark progress
8. **Pending Salaries** - Check worker earnings
9. **Create Salary Payment** - Pay worker
10. **Audit Logs** - Review system activity

### Quick Product Test
1. Login
2. Create Product
3. List Products
4. Update Product
5. Get Product Details

### Quick Worker Test
1. Login
2. Create Worker
3. List Workers
4. Update Worker
5. Get Worker Details

## Error Handling

The collection handles common scenarios:
- **401 Unauthorized** - Token expired, run Login again
- **403 Forbidden** - Admin permissions required
- **400 Bad Request** - Check request body format
- **404 Not Found** - Resource doesn't exist

## Tips

1. **Always login first** - Most endpoints require authentication
2. **Use the environment** - Variables are automatically set/used
3. **Check responses** - Review response data for debugging
4. **Admin vs Manager** - Some endpoints require admin role
5. **Sequential testing** - Some requests depend on previous ones

## Troubleshooting

### Token Issues
- Run the Login request to refresh tokens
- Check that username/password are correct
- Verify backend server is running

### Missing Variables
- Check that previous requests completed successfully
- Manually set variables if needed
- Review the environment variable values

### Permission Errors
- Ensure you're logged in as admin for admin-only endpoints
- Check user role in environment variables

### Connection Issues
- Verify `base_url` points to running backend
- Check that Django server is accessible
- Confirm CORS settings allow requests

## Sample Data

The environment includes sample credentials:
- Username: `admin`
- Password: `admin123`

Update these to match your actual admin user credentials.

## Advanced Usage

### Custom Environments
Create separate environments for:
- Development (`http://localhost:8000`)
- Staging (`https://staging.bottleflow.com`)
- Production (`https://api.bottleflow.com`)

### Automated Testing
Use Postman's test scripts for automated validation:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('id');
    pm.expect(response).to.have.property('name');
});
```

### Collection Runner
Use Postman's Collection Runner to:
- Run entire collection automatically
- Test multiple scenarios
- Generate test reports
- Validate API behavior

Enjoy testing your BottleFlow API! 🚀
