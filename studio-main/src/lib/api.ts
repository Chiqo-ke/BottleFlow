// API Configuration and Base Service
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// App Configuration
export const APP_CONFIG = {
  apiUrl: API_BASE_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'BottleFlow',
  companyDomain: process.env.NEXT_PUBLIC_COMPANY_DOMAIN || 'bottleflow.com',
  adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@bottleflow.com',
  defaultAvatarUrl: process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL || 'https://ui-avatars.com/api/?name={name}&background=random',
};

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// User and Authentication Types
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'manager';
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  purchase_price: string;
  wash_price: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  purchase_price: string;
  wash_price: string;
}

// Worker Types
export interface Worker {
  id: string;
  name: string;
  phone_number: string;
  id_number: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkerData {
  name: string;
  phone_number: string;
  id_number: string;
  role: string;
  email?: string;
  is_active?: boolean;
}

// Purchase Types
export interface PurchaseItem {
  id?: string;
  product: string;
  quantity: number;
  cost: string;
  product_name?: string;
}

export interface Purchase {
  id: string;
  date: string;
  amount_paid: string;
  total_cost: string;
  balance: string;
  notes: string;
  items: PurchaseItem[];
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseData {
  date: string;
  amount_paid: string;
  notes?: string;
  items: Omit<PurchaseItem, 'id' | 'product_name'>[];
}

// Task Types
export interface Task {
  id: string;
  worker: string;
  worker_name?: string;
  product?: string;
  product_name?: string;
  task_type: 'washing' | 'daily_salary';
  assigned_quantity?: number;
  washed_quantity?: number;
  salary: string;
  deduction: string;
  net_salary: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  worker: string;
  product?: string;
  task_type: 'washing' | 'daily_salary';
  assigned_quantity?: number;
  salary: string;
  deduction?: string;
  date: string;
  notes?: string;
}

// Stock Types
export interface StockItem {
  product_id: string;
  product_name: string;
  raw_stock: number;
  washed_stock: number;
  total_stock: number;
  purchase_price: string;
  wash_price: string;
}

export interface StockMovement {
  id: string;
  product: string;
  product_name: string;
  type: 'purchase' | 'sell_raw' | 'sell_washed' | 'assign_wash' | 'complete_wash';
  quantity: number;
  date: string;
  notes: string;
}

export interface StockSaleData {
  product: string;
  sale_type: 'raw' | 'washed';
  quantity: number;
  price_per_unit: string;
  customer_name?: string;
  date: string;
  notes?: string;
}

// Salary Types
export interface PendingSalary {
  worker_id: string;
  worker_name: string;
  worker_role: string;
  pending_salary: string;
  total_earned: string;
  total_paid: string;
  last_payment_date?: string;
}

export interface SalaryPayment {
  id: string;
  worker: string;
  worker_name?: string;
  amount: string;
  date: string;
  payment_method: string;
  notes: string;
  created_at: string;
}

export interface CreateSalaryPaymentData {
  worker: string;
  amount: string;
  date: string;
  payment_method: string;
  notes?: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  user: string;
  user_name?: string;
  action: string;
  model_name: string;
  object_id: string;
  changes: Record<string, any>;
  timestamp: string;
}

// Error Types
export interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

// Token Management
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private tokenManager: TokenManager;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.tokenManager = TokenManager.getInstance();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.tokenManager.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && token) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request with new token
            return this.request<T>(endpoint, options);
          } else {
            this.tokenManager.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return {
              success: false,
              error: 'Session expired. Please login again.',
            };
          }
        }

        return {
          success: false,
          error: this.formatError(data, response.status),
          data: data,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.tokenManager.setTokens(data.access, refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  private formatError(error: any, status: number): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      // Handle Django REST framework validation errors
      if (error.detail) {
        return error.detail;
      }

      // Handle field validation errors
      const fieldErrors: string[] = [];
      for (const [field, messages] of Object.entries(error)) {
        if (Array.isArray(messages)) {
          fieldErrors.push(`${field}: ${messages.join(', ')}`);
        } else if (typeof messages === 'string') {
          fieldErrors.push(`${field}: ${messages}`);
        }
      }

      if (fieldErrors.length > 0) {
        return fieldErrors.join('; ');
      }
    }

    // Default error messages based on status code
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.tokenManager.setTokens(
        response.data.tokens.access,
        response.data.tokens.refresh
      );
      
      // Store user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', response.data.user.role);
      }
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/me/');
  }

  logout() {
    this.tokenManager.clearTokens();
  }

  // Product Methods
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>('/api/products/');
  }

  async createProduct(data: CreateProductData): Promise<ApiResponse<Product>> {
    return this.request<Product>('/api/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/api/products/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/products/${id}/`, {
      method: 'DELETE',
    });
  }

  // Worker Methods
  async getWorkers(): Promise<ApiResponse<Worker[]>> {
    return this.request<Worker[]>('/api/workers/');
  }

  async createWorker(data: CreateWorkerData): Promise<ApiResponse<Worker>> {
    return this.request<Worker>('/api/workers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorker(id: string, data: Partial<CreateWorkerData>): Promise<ApiResponse<Worker>> {
    return this.request<Worker>(`/api/workers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorker(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/workers/${id}/`, {
      method: 'DELETE',
    });
  }

  // Purchase Methods
  async getPurchases(summary?: boolean): Promise<ApiResponse<Purchase[]>> {
    const params = summary ? '?summary=true' : '';
    return this.request<Purchase[]>(`/api/purchases/${params}`);
  }

  async createPurchase(data: CreatePurchaseData): Promise<ApiResponse<Purchase>> {
    return this.request<Purchase>('/api/purchases/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchase(id: string, data: { amount_paid: string; notes?: string }): Promise<ApiResponse<Purchase>> {
    return this.request<Purchase>(`/api/purchases/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Task Methods
  async getTasks(params?: {
    worker_id?: string;
    status?: string;
    task_type?: string;
    summary?: boolean;
  }): Promise<ApiResponse<Task[]>> {
    const queryParams = new URLSearchParams();
    if (params?.worker_id) queryParams.append('worker_id', params.worker_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.task_type) queryParams.append('task_type', params.task_type);
    if (params?.summary) queryParams.append('summary', 'true');
    
    const query = queryParams.toString();
    return this.request<Task[]>(`/api/tasks/${query ? `?${query}` : ''}`);
  }

  async createTask(data: CreateTaskData): Promise<ApiResponse<Task>> {
    const endpoint = data.task_type === 'daily_salary' ? '/api/tasks/daily-salary/' : '/api/tasks/';
    return this.request<Task>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: { washed_quantity?: number; notes?: string }): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/api/tasks/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getWorkerTasks(workerId: string, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<Task[]>> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const query = queryParams.toString();
    return this.request<Task[]>(`/api/tasks/worker/${workerId}/${query ? `?${query}` : ''}`);
  }

  async getTaskStatistics(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/tasks/statistics/');
  }

  // Stock Methods
  async getStock(): Promise<ApiResponse<StockItem[]>> {
    return this.request<StockItem[]>('/api/stock/');
  }

  async getStockMovements(params?: {
    product_id?: string;
    type?: string;
  }): Promise<ApiResponse<StockMovement[]>> {
    const queryParams = new URLSearchParams();
    if (params?.product_id) queryParams.append('product_id', params.product_id);
    if (params?.type) queryParams.append('type', params.type);
    
    const query = queryParams.toString();
    return this.request<StockMovement[]>(`/api/stock/movements/${query ? `?${query}` : ''}`);
  }

  async recordStockSale(data: StockSaleData): Promise<ApiResponse<any>> {
    return this.request<any>('/api/stock/sell/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProductStock(productId: string): Promise<ApiResponse<StockItem>> {
    return this.request<StockItem>(`/api/stock/${productId}/`);
  }

  // Salary Methods
  async getPendingSalaries(includeZero?: boolean): Promise<ApiResponse<PendingSalary[]>> {
    const params = includeZero ? '?include_zero=true' : '';
    return this.request<PendingSalary[]>(`/api/salaries/pending/${params}`);
  }

  async getSalaryPayments(params?: {
    worker_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<SalaryPayment[]>> {
    const queryParams = new URLSearchParams();
    if (params?.worker_id) queryParams.append('worker_id', params.worker_id);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const query = queryParams.toString();
    return this.request<SalaryPayment[]>(`/api/salaries/payments/${query ? `?${query}` : ''}`);
  }

  async createSalaryPayment(data: CreateSalaryPaymentData): Promise<ApiResponse<SalaryPayment>> {
    return this.request<SalaryPayment>('/api/salaries/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkerSalaryHistory(workerId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/salaries/worker/${workerId}/`);
  }

  async getSalarySummary(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/salaries/summary/');
  }

  // Audit Methods
  async getAuditLogs(params?: {
    user_id?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
    summary?: boolean;
  }): Promise<ApiResponse<AuditLog[]>> {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.summary) queryParams.append('summary', 'true');
    
    const query = queryParams.toString();
    return this.request<AuditLog[]>(`/api/audit/${query ? `?${query}` : ''}`);
  }

  async getAuditStatistics(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/audit/statistics/');
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export { TokenManager };
