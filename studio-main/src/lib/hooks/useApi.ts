import { useState, useEffect, useCallback } from 'react';
import BottleFlowApiService from '../api-adapter';
import type { 
  Product, 
  Worker, 
  Purchase, 
  Task, 
  Salary, 
  Stock, 
  AuditLog 
} from '../types';

// Generic hook for API calls with loading and error states
export function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for each data type
export function useProducts() {
  return useApiCall(() => BottleFlowApiService.getProducts());
}

export function useWorkers() {
  return useApiCall(() => BottleFlowApiService.getWorkers());
}

export function usePurchases() {
  return useApiCall(() => BottleFlowApiService.getPurchases());
}

export function useTasks() {
  return useApiCall(() => BottleFlowApiService.getTasks());
}

export function useSalaries() {
  return useApiCall(() => BottleFlowApiService.getSalaries());
}

export function useStock() {
  return useApiCall(() => BottleFlowApiService.getStock());
}

export function useAuditLogs() {
  return useApiCall(() => BottleFlowApiService.getAuditLogs());
}

export function useWorkerPayments(workerId: string | null) {
  return useApiCall(
    () => BottleFlowApiService.getWorkerPayments(workerId),
    [workerId]
  );
}

// Mutation hooks for create/update/delete operations
export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (product: Omit<Product, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await BottleFlowApiService.createProduct(product);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProduct, loading, error };
}

export function useUpdateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await BottleFlowApiService.updateProduct(id, updates);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProduct, loading, error };
}

export function useCreateWorker() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorker = async (worker: Omit<Worker, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await BottleFlowApiService.createWorker(worker);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create worker';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createWorker, loading, error };
}

export function useUpdateWorker() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWorker = async (id: string, updates: Partial<Omit<Worker, 'id'>>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await BottleFlowApiService.updateWorker(id, updates);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update worker';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateWorker, loading, error };
}

export function useCreatePurchase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPurchase = async (purchase: Omit<Purchase, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await BottleFlowApiService.createPurchase(purchase);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create purchase';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createPurchase, loading, error };
}

export function useCreateTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (task: Omit<Task, 'id' | 'workerName' | 'productName' | 'netPay'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await BottleFlowApiService.createTask(task);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTask, loading, error };
}

export function useUpdateTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTask = async (id: string, updates: { washedQuantity?: number; notes?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await BottleFlowApiService.updateTask(id, updates);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateTask, loading, error };
}

export function useUpdateStock() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStock = async (movement: { 
    productId: string; 
    type: 'purchase' | 'assign_wash' | 'complete_wash' | 'sell_raw' | 'sell_washed'; 
    quantity: number 
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await BottleFlowApiService.updateStock(movement);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stock';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateStock, loading, error };
}

export function useUpdateWorkerPayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWorkerPayments = async (workerId: string, amount: number) => {
    try {
      setLoading(true);
      setError(null);
      await BottleFlowApiService.updateWorkerPayments(workerId, amount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record payment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateWorkerPayments, loading, error };
}
