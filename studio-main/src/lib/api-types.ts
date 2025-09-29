// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Request Types
export interface CreateProductRequest {
  name: string;
  purchasePrice: number;
  washPrice: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface CreateWorkerRequest {
  name: string;
  phoneNumber: string;
  idNumber: string;
  role: string;
  email?: string;
}

export interface UpdateWorkerRequest extends Partial<CreateWorkerRequest> {
  id: string;
}

export interface CreatePurchaseRequest {
  items: Array<{
    productId: string;
    quantity: number;
    cost: number;
  }>;
  totalCost: number;
  amountPaid: number;
  date: string;
}

export interface CreateTaskRequest {
  workerId: string;
  productId: string;
  assignedQuantity: number;
  date: string;
}

export interface UpdateTaskRequest {
  id: string;
  washedQuantity?: number;
  status?: 'Pending' | 'In Progress' | 'Completed';
  deduction?: number;
}

export interface WorkerPaymentRequest {
  workerId: string;
  amount: number;
  date?: string;
}

export interface StockMovementRequest {
  productId: string;
  type: 'purchase' | 'assign_wash' | 'complete_wash' | 'sell_raw' | 'sell_washed';
  quantity: number;
}

// Query Parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  workerId?: string;
  productId?: string;
  status?: string;
}
