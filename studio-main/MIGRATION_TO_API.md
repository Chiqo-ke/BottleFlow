# Migration from Mock Data to Real API

This document outlines the comprehensive migration from mock data to real API calls in the BottleFlow frontend application.

## Overview

The frontend application has been successfully migrated from using mock data to making actual API calls to a backend server. This migration includes:

- ✅ Complete API service layer with TypeScript types
- ✅ React hooks for data fetching with loading and error states
- ✅ Updated all dashboard components to use API calls
- ✅ Proper error handling and loading states
- ✅ Configuration management for API endpoints

## Files Created/Modified

### New API Infrastructure Files

1. **`src/lib/config.ts`** - API configuration and endpoint definitions
2. **`src/lib/api-types.ts`** - API request/response types and interfaces
3. **`src/lib/api-adapter.ts`** - Service layer that adapts backend API to frontend types
4. **`src/lib/hooks/useApi.ts`** - React hooks for data fetching and mutations

### Updated Component Files

1. **`src/components/dashboard/overview.tsx`** - Dashboard overview with API integration
2. **`src/components/dashboard/stock-client.tsx`** - Stock management with API calls
3. **`src/components/dashboard/audit-client.tsx`** - Audit logs from API
4. **`src/components/dashboard/tasks-client.tsx`** - Task management with API integration
5. **`src/components/dashboard/salaries-client.tsx`** - Salary display with API data
6. **`src/components/dashboard/expenses-client.tsx`** - Expense tracking with API data
7. **`src/components/dashboard/salary-payments-client.tsx`** - Payment processing with API

## API Configuration

### Base Configuration (`src/lib/config.ts`)

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  ENDPOINTS: {
    PRODUCTS: '/products',
    WORKERS: '/workers',
    PURCHASES: '/purchases',
    TASKS: '/tasks',
    SALARIES: '/salaries',
    STOCK: '/stock',
    AUDIT_LOGS: '/audit-logs',
    WORKER_PAYMENTS: '/worker-payments',
  },
  TIMEOUT: 10000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};
```

### Environment Variables

Set the following environment variable to configure your API base URL:

```bash
NEXT_PUBLIC_API_BASE_URL=http://your-backend-server:port/api
```

## API Service Layer

### Data Transformation

The `ApiAdapter` class in `src/lib/api-adapter.ts` handles transformation between backend and frontend data formats:

- **Products**: Maps backend `purchase_price`/`wash_price` strings to frontend `purchasePrice`/`washPrice` numbers
- **Workers**: Maps backend `phone_number`/`id_number` to frontend `phoneNumber`/`idNumber`
- **Tasks**: Handles complex task data with salary calculations
- **Stock**: Transforms backend stock data to frontend stock format
- **Audit Logs**: Formats audit log details from backend changes object

### API Methods

The `BottleFlowApiService` class provides frontend-compatible methods:

```typescript
// Products
static async getProducts(): Promise<FrontendProduct[]>
static async createProduct(product: Omit<FrontendProduct, 'id'>): Promise<FrontendProduct>
static async updateProduct(id: string, updates: Partial<Omit<FrontendProduct, 'id'>>): Promise<FrontendProduct>
static async deleteProduct(id: string): Promise<void>

// Workers
static async getWorkers(): Promise<FrontendWorker[]>
static async createWorker(worker: Omit<FrontendWorker, 'id'>): Promise<FrontendWorker>
static async updateWorker(id: string, updates: Partial<Omit<FrontendWorker, 'id'>>): Promise<FrontendWorker>
static async deleteWorker(id: string): Promise<void>

// And similar methods for purchases, tasks, stock, salaries, etc.
```

## React Hooks

### Data Fetching Hooks

```typescript
// Basic data fetching
const { data, loading, error, refetch } = useProducts();
const { data, loading, error, refetch } = useWorkers();
const { data, loading, error, refetch } = useTasks();
const { data, loading, error, refetch } = useStock();
const { data, loading, error, refetch } = useAuditLogs();

// Parameterized hooks
const { data, loading, error } = useWorkerPayments(workerId);
```

### Mutation Hooks

```typescript
// Create operations
const { createProduct, loading, error } = useCreateProduct();
const { createWorker, loading, error } = useCreateWorker();
const { createTask, loading, error } = useCreateTask();

// Update operations
const { updateProduct, loading, error } = useUpdateProduct();
const { updateTask, loading, error } = useUpdateTask();
const { updateStock, loading, error } = useUpdateStock();
const { updateWorkerPayments, loading, error } = useUpdateWorkerPayments();
```

## Component Updates

### Loading States

All components now include skeleton loading states:

```typescript
if (loading) {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );
}
```

### Error Handling

Components include comprehensive error handling:

```typescript
if (error) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Data Mutations

Form submissions now use async operations with proper error handling:

```typescript
const onSubmit = async (data) => {
  try {
    await createProduct(data);
    toast({ title: 'Success', description: 'Product created successfully' });
    refetch(); // Refresh data
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to create product. Please try again.',
    });
  }
};
```

## Backend API Requirements

Your backend API should provide the following endpoints:

### Products
- `GET /api/products/` - List all products
- `POST /api/products/` - Create a new product
- `PUT /api/products/{id}/` - Update a product
- `DELETE /api/products/{id}/` - Delete a product

### Workers
- `GET /api/workers/` - List all workers
- `POST /api/workers/` - Create a new worker
- `PUT /api/workers/{id}/` - Update a worker
- `DELETE /api/workers/{id}/` - Delete a worker

### Tasks
- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create a new task
- `PUT /api/tasks/{id}/` - Update a task

### Stock
- `GET /api/stock/` - Get current stock levels
- `POST /api/stock/sell/` - Record stock sales

### Purchases
- `GET /api/purchases/` - List all purchases
- `POST /api/purchases/` - Create a new purchase

### Salary Payments
- `GET /api/salaries/payments/` - List salary payments
- `POST /api/salaries/payments/` - Record a salary payment
- `GET /api/salaries/pending/` - Get pending salaries

### Audit Logs
- `GET /api/audit/` - List audit logs

## Data Format Examples

### Product Format
```typescript
// Frontend format
{
  id: string;
  name: string;
  purchasePrice: number;
  washPrice: number;
}

// Backend format
{
  id: string;
  name: string;
  purchase_price: string;
  wash_price: string;
  created_at: string;
  updated_at: string;
}
```

### Worker Format
```typescript
// Frontend format
{
  id: string;
  name: string;
  phoneNumber: string;
  idNumber: string;
  role: string;
  email?: string;
}

// Backend format
{
  id: string;
  name: string;
  phone_number: string;
  id_number: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## Migration Benefits

1. **Real-time Data**: Components now display actual data from your backend
2. **Proper State Management**: Loading and error states provide better UX
3. **Type Safety**: Full TypeScript support with proper type checking
4. **Scalability**: Easy to extend with new API endpoints
5. **Error Handling**: Comprehensive error handling and user feedback
6. **Performance**: Efficient data fetching with React hooks
7. **Maintainability**: Clean separation between API layer and UI components

## Next Steps

1. **Set up your backend API** with the required endpoints
2. **Configure the API base URL** in your environment variables
3. **Test the integration** by running the frontend application
4. **Customize error messages** and loading states as needed
5. **Add authentication** if required by your backend
6. **Implement real-time updates** using WebSockets or polling if needed

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **Network Errors**: Check that your backend server is running and accessible
3. **Type Errors**: Verify that backend response formats match expected types
4. **Authentication**: Add proper authentication headers if required

### Debug Mode

To debug API calls, check the browser's Network tab in Developer Tools to see:
- Request URLs and methods
- Request/response headers
- Response data and status codes
- Error messages

## Conclusion

The migration from mock data to real API calls is now complete. All components have been updated to use the new API service layer with proper error handling, loading states, and TypeScript support. The application is now ready to connect to a real backend server and handle live data.
