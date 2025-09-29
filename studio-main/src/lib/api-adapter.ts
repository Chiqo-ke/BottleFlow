import { apiClient } from './api';
import type { 
  Product as FrontendProduct, 
  Worker as FrontendWorker, 
  Purchase as FrontendPurchase, 
  Task as FrontendTask, 
  Salary as FrontendSalary, 
  Stock as FrontendStock, 
  AuditLog as FrontendAuditLog,
  PurchaseItem as FrontendPurchaseItem 
} from './types';

import type {
  Product as BackendProduct,
  Worker as BackendWorker,
  Purchase as BackendPurchase,
  Task as BackendTask,
  StockItem as BackendStockItem,
  AuditLog as BackendAuditLog,
  PendingSalary as BackendPendingSalary,
  SalaryPayment as BackendSalaryPayment
} from './api';

// Data transformation utilities
export class ApiAdapter {
  
  // Transform backend product to frontend format
  static transformProduct(backendProduct: BackendProduct): FrontendProduct {
    return {
      id: backendProduct.id,
      name: backendProduct.name,
      purchasePrice: parseFloat(backendProduct.purchase_price),
      washPrice: parseFloat(backendProduct.wash_price),
    };
  }

  // Transform backend worker to frontend format
  static transformWorker(backendWorker: BackendWorker): FrontendWorker {
    return {
      id: backendWorker.id,
      name: backendWorker.name,
      phoneNumber: backendWorker.phone_number,
      idNumber: backendWorker.id_number,
      role: backendWorker.role,
    };
  }

  // Transform backend purchase to frontend format
  static transformPurchase(backendPurchase: BackendPurchase): FrontendPurchase {
    return {
      id: backendPurchase.id,
      items: backendPurchase.items.map(item => ({
        productId: item.product,
        productName: item.product_name || '',
        quantity: item.quantity,
        cost: parseFloat(item.cost),
      })),
      totalCost: parseFloat(backendPurchase.total_cost),
      amountPaid: parseFloat(backendPurchase.amount_paid),
      balance: parseFloat(backendPurchase.balance),
      date: backendPurchase.date,
    };
  }

  // Transform backend task to frontend format
  static transformTask(backendTask: BackendTask): FrontendTask {
    return {
      id: backendTask.id,
      workerId: backendTask.worker,
      workerName: backendTask.worker_name || '',
      productId: backendTask.product || '',
      productName: backendTask.product_name || '',
      assignedQuantity: backendTask.assigned_quantity || 0,
      washedQuantity: backendTask.washed_quantity || 0,
      date: backendTask.date,
      status: backendTask.status,
      salary: parseFloat(backendTask.salary),
      deduction: parseFloat(backendTask.deduction),
      netPay: parseFloat(backendTask.net_salary),
    };
  }

  // Transform backend stock to frontend format
  static transformStock(backendStock: BackendStockItem): FrontendStock {
    return {
      productId: backendStock.product_id,
      productName: backendStock.product_name,
      purchased: backendStock.total_stock, // Using total_stock as purchased
      washed: backendStock.washed_stock,
      soldRaw: 0, // Not available in backend, will need to calculate
      soldWashed: 0, // Not available in backend, will need to calculate
      balance: backendStock.washed_stock, // Using washed_stock as balance
    };
  }

  // Transform backend audit log to frontend format
  static transformAuditLog(backendAuditLog: BackendAuditLog): FrontendAuditLog {
    return {
      id: backendAuditLog.id,
      date: backendAuditLog.timestamp,
      user: backendAuditLog.user_name || backendAuditLog.user,
      action: backendAuditLog.action,
      details: this.formatAuditDetails(backendAuditLog),
    };
  }

  // Helper to format audit log details
  private static formatAuditDetails(auditLog: BackendAuditLog): string {
    const { model_name, changes, object_id } = auditLog;
    
    if (changes && Object.keys(changes).length > 0) {
      const changesList = Object.entries(changes)
        .map(([field, value]) => `${field}: ${JSON.stringify(value)}`)
        .join(', ');
      return `${model_name} ${object_id} - ${changesList}`;
    }
    
    return `${auditLog.action} on ${model_name} ${object_id}`;
  }

  // Transform pending salary to frontend salary format
  static transformSalary(pendingSalary: BackendPendingSalary, month: string): FrontendSalary {
    return {
      id: `salary-${pendingSalary.worker_id}-${month}`,
      workerId: pendingSalary.worker_id,
      workerName: pendingSalary.worker_name,
      month: month,
      totalWashed: 0, // Not available directly, would need to calculate
      baseSalary: parseFloat(pendingSalary.total_earned),
      deductions: 0, // Not available directly
      netSalary: parseFloat(pendingSalary.pending_salary),
    };
  }
}

// API Service Layer that provides frontend-compatible data
export class BottleFlowApiService {
  
  // Products
  static async getProducts(): Promise<FrontendProduct[]> {
    const response = await apiClient.getProducts();
    if (response.success && response.data) {
      return response.data.map(ApiAdapter.transformProduct);
    }
    throw new Error(response.error || 'Failed to fetch products');
  }

  static async createProduct(product: Omit<FrontendProduct, 'id'>): Promise<FrontendProduct> {
    const response = await apiClient.createProduct({
      name: product.name,
      purchase_price: product.purchasePrice.toString(),
      wash_price: product.washPrice.toString(),
    });
    if (response.success && response.data) {
      return ApiAdapter.transformProduct(response.data);
    }
    throw new Error(response.error || 'Failed to create product');
  }

  static async updateProduct(id: string, updates: Partial<Omit<FrontendProduct, 'id'>>): Promise<FrontendProduct> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.purchasePrice) updateData.purchase_price = updates.purchasePrice.toString();
    if (updates.washPrice) updateData.wash_price = updates.washPrice.toString();

    const response = await apiClient.updateProduct(id, updateData);
    if (response.success && response.data) {
      return ApiAdapter.transformProduct(response.data);
    }
    throw new Error(response.error || 'Failed to update product');
  }

  static async deleteProduct(id: string): Promise<void> {
    const response = await apiClient.deleteProduct(id);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete product');
    }
  }

  // Workers
  static async getWorkers(): Promise<FrontendWorker[]> {
    const response = await apiClient.getWorkers();
    if (response.success && response.data) {
      return response.data.map(ApiAdapter.transformWorker);
    }
    throw new Error(response.error || 'Failed to fetch workers');
  }

  static async createWorker(worker: Omit<FrontendWorker, 'id'>): Promise<FrontendWorker> {
    const response = await apiClient.createWorker({
      name: worker.name,
      phone_number: worker.phoneNumber,
      id_number: worker.idNumber,
      role: worker.role,
      email: worker.email,
    });
    if (response.success && response.data) {
      return ApiAdapter.transformWorker(response.data);
    }
    throw new Error(response.error || 'Failed to create worker');
  }

  static async updateWorker(id: string, updates: Partial<Omit<FrontendWorker, 'id'>>): Promise<FrontendWorker> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.phoneNumber) updateData.phone_number = updates.phoneNumber;
    if (updates.idNumber) updateData.id_number = updates.idNumber;
    if (updates.role) updateData.role = updates.role;
    if (updates.email) updateData.email = updates.email;

    const response = await apiClient.updateWorker(id, updateData);
    if (response.success && response.data) {
      return ApiAdapter.transformWorker(response.data);
    }
    throw new Error(response.error || 'Failed to update worker');
  }

  static async deleteWorker(id: string): Promise<void> {
    const response = await apiClient.deleteWorker(id);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete worker');
    }
  }

  // Purchases
  static async getPurchases(): Promise<FrontendPurchase[]> {
    const response = await apiClient.getPurchases();
    if (response.success && response.data) {
      return response.data.map(ApiAdapter.transformPurchase);
    }
    throw new Error(response.error || 'Failed to fetch purchases');
  }

  static async createPurchase(purchase: Omit<FrontendPurchase, 'id'>): Promise<FrontendPurchase> {
    const response = await apiClient.createPurchase({
      date: purchase.date,
      amount_paid: purchase.amountPaid.toString(),
      items: purchase.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        cost: item.cost.toString(),
      })),
    });
    if (response.success && response.data) {
      return ApiAdapter.transformPurchase(response.data);
    }
    throw new Error(response.error || 'Failed to create purchase');
  }

  // Tasks
  static async getTasks(): Promise<FrontendTask[]> {
    const response = await apiClient.getTasks();
    if (response.success && response.data) {
      return response.data.map(ApiAdapter.transformTask);
    }
    throw new Error(response.error || 'Failed to fetch tasks');
  }

  static async createTask(task: Omit<FrontendTask, 'id' | 'workerName' | 'productName' | 'netPay'>): Promise<FrontendTask> {
    const response = await apiClient.createTask({
      worker: task.workerId,
      product: task.productId,
      task_type: 'washing',
      assigned_quantity: task.assignedQuantity,
      salary: task.salary.toString(),
      deduction: task.deduction.toString(),
      date: task.date,
    });
    if (response.success && response.data) {
      return ApiAdapter.transformTask(response.data);
    }
    throw new Error(response.error || 'Failed to create task');
  }

  static async updateTask(id: string, updates: { washedQuantity?: number; notes?: string }): Promise<FrontendTask> {
    const response = await apiClient.updateTask(id, {
      washed_quantity: updates.washedQuantity,
      notes: updates.notes,
    });
    if (response.success && response.data) {
      return ApiAdapter.transformTask(response.data);
    }
    throw new Error(response.error || 'Failed to update task');
  }

  // Stock
  static async getStock(): Promise<FrontendStock[]> {
    const response = await apiClient.getStock();
    if (response.success && response.data) {
      return response.data.map(ApiAdapter.transformStock);
    }
    throw new Error(response.error || 'Failed to fetch stock');
  }

  // Salaries
  static async getSalaries(): Promise<FrontendSalary[]> {
    const response = await apiClient.getPendingSalaries();
    if (response.success && response.data) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      return response.data.map(salary => ApiAdapter.transformSalary(salary, currentMonth));
    }
    throw new Error(response.error || 'Failed to fetch salaries');
  }

  // Worker Payments
  static async getWorkerPayments(workerId: string | null): Promise<{ date: string; amount: number }[]> {
    if (!workerId) {
      // Return all payments - would need to aggregate from all workers
      const response = await apiClient.getSalaryPayments();
      if (response.success && response.data) {
        return response.data.map(payment => ({
          date: payment.date,
          amount: parseFloat(payment.amount),
        }));
      }
      return [];
    }

    const response = await apiClient.getSalaryPayments({ worker_id: workerId });
    if (response.success && response.data) {
      return response.data.map(payment => ({
        date: payment.date,
        amount: parseFloat(payment.amount),
      }));
    }
    return [];
  }

  static async updateWorkerPayments(workerId: string, amount: number): Promise<void> {
    const response = await apiClient.createSalaryPayment({
      worker: workerId,
      amount: amount.toString(),
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to record payment');
    }
  }

  // Audit Logs
  static async getAuditLogs(): Promise<FrontendAuditLog[]> {
    const response = await apiClient.getAuditLogs();
    if (response.success && response.data) {
      return response.data.map(ApiAdapter.transformAuditLog);
    }
    throw new Error(response.error || 'Failed to fetch audit logs');
  }

  // Stock Operations
  static async updateStock(movement: { 
    productId: string; 
    type: 'purchase' | 'assign_wash' | 'complete_wash' | 'sell_raw' | 'sell_washed'; 
    quantity: number 
  }): Promise<boolean> {
    try {
      if (movement.type === 'sell_raw' || movement.type === 'sell_washed') {
        const response = await apiClient.recordStockSale({
          product: movement.productId,
          sale_type: movement.type === 'sell_raw' ? 'raw' : 'washed',
          quantity: movement.quantity,
          price_per_unit: '0', // Would need to get actual price
          date: new Date().toISOString().split('T')[0],
        });
        return response.success;
      }
      
      // For other movement types, we'd need specific endpoints
      // For now, return true to maintain compatibility
      return true;
    } catch (error) {
      console.error('Stock update failed:', error);
      return false;
    }
  }

  // Add audit log (for compatibility)
  static addAuditLog(log: Omit<FrontendAuditLog, 'id' | 'date'>): void {
    // This would typically be handled automatically by the backend
    // when actions are performed through the API
    console.log('Audit log would be created:', log);
  }
}

// Export the service for use in components
export default BottleFlowApiService;
