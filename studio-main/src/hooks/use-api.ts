"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Generic hook for API calls with loading and error states
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean;
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    successMessage?: string;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    immediate = true,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = 'Operation completed successfully',
  } = options;

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data || null);
        if (showSuccessToast) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);
        if (showErrorToast) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
      
      return response;
    } catch (err) {
      const errorMessage = 'Network error occurred';
      setError(errorMessage);
      if (showErrorToast) {
        toast({
          title: "Network Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, showErrorToast, showSuccessToast, successMessage, toast]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    isLoading,
    error,
    refetch,
    execute,
  };
}

// Hook for mutations (create, update, delete operations)
export function useMutation<TData, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: {
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
  } = options;

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await mutationFn(variables);
      
      if (response.success && response.data) {
        if (showSuccessToast) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }
        onSuccess?.(response.data);
        return response;
      } else {
        const errorMessage = response.error || 'Operation failed';
        setError(errorMessage);
        if (showErrorToast) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
        onError?.(errorMessage);
        return response;
      }
    } catch (err) {
      const errorMessage = 'Network error occurred';
      setError(errorMessage);
      if (showErrorToast) {
        toast({
          title: "Network Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, toast]);

  return {
    mutate,
    isLoading,
    error,
  };
}

// Specific hooks for different API endpoints

// Products
export function useProducts() {
  return useApiCall(() => apiClient.getProducts(), [], {
    showErrorToast: true,
  });
}

export function useCreateProduct() {
  return useMutation(apiClient.createProduct.bind(apiClient), {
    successMessage: 'Product created successfully',
  });
}

export function useUpdateProduct() {
  return useMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateProduct(id, data),
    {
      successMessage: 'Product updated successfully',
    }
  );
}

export function useDeleteProduct() {
  return useMutation(apiClient.deleteProduct.bind(apiClient), {
    successMessage: 'Product deleted successfully',
  });
}

// Workers
export function useWorkers() {
  return useApiCall(() => apiClient.getWorkers(), [], {
    showErrorToast: true,
  });
}

export function useCreateWorker() {
  return useMutation(apiClient.createWorker.bind(apiClient), {
    successMessage: 'Worker created successfully',
  });
}

export function useUpdateWorker() {
  return useMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateWorker(id, data),
    {
      successMessage: 'Worker updated successfully',
    }
  );
}

export function useDeleteWorker() {
  return useMutation(apiClient.deleteWorker.bind(apiClient), {
    successMessage: 'Worker deleted successfully',
  });
}

// Purchases
export function usePurchases(summary?: boolean) {
  return useApiCall(() => apiClient.getPurchases(summary), [summary], {
    showErrorToast: true,
  });
}

export function useCreatePurchase() {
  return useMutation(apiClient.createPurchase.bind(apiClient), {
    successMessage: 'Purchase recorded successfully',
  });
}

export function useUpdatePurchase() {
  return useMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updatePurchase(id, data),
    {
      successMessage: 'Purchase updated successfully',
    }
  );
}

// Tasks
export function useTasks(params?: {
  worker_id?: string;
  status?: string;
  task_type?: string;
  summary?: boolean;
}) {
  return useApiCall(() => apiClient.getTasks(params), [params], {
    showErrorToast: true,
  });
}

export function useCreateTask() {
  return useMutation(apiClient.createTask.bind(apiClient), {
    successMessage: 'Task created successfully',
  });
}

export function useUpdateTask() {
  return useMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateTask(id, data),
    {
      successMessage: 'Task updated successfully',
    }
  );
}

export function useWorkerTasks(workerId: string, params?: {
  start_date?: string;
  end_date?: string;
}) {
  return useApiCall(
    () => apiClient.getWorkerTasks(workerId, params),
    [workerId, params],
    {
      showErrorToast: true,
      immediate: !!workerId,
    }
  );
}

export function useTaskStatistics() {
  return useApiCall(() => apiClient.getTaskStatistics(), [], {
    showErrorToast: true,
  });
}

// Stock
export function useStock() {
  return useApiCall(() => apiClient.getStock(), [], {
    showErrorToast: true,
  });
}

export function useStockMovements(params?: {
  product_id?: string;
  type?: string;
}) {
  return useApiCall(() => apiClient.getStockMovements(params), [params], {
    showErrorToast: true,
  });
}

export function useRecordStockSale() {
  return useMutation(apiClient.recordStockSale.bind(apiClient), {
    successMessage: 'Stock sale recorded successfully',
  });
}

export function useProductStock(productId: string) {
  return useApiCall(
    () => apiClient.getProductStock(productId),
    [productId],
    {
      showErrorToast: true,
      immediate: !!productId,
    }
  );
}

// Salaries
export function usePendingSalaries(includeZero?: boolean) {
  return useApiCall(() => apiClient.getPendingSalaries(includeZero), [includeZero], {
    showErrorToast: true,
  });
}

export function useSalaryPayments(params?: {
  worker_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useApiCall(() => apiClient.getSalaryPayments(params), [params], {
    showErrorToast: true,
  });
}

export function useCreateSalaryPayment() {
  return useMutation(apiClient.createSalaryPayment.bind(apiClient), {
    successMessage: 'Salary payment recorded successfully',
  });
}

export function useWorkerSalaryHistory(workerId: string) {
  return useApiCall(
    () => apiClient.getWorkerSalaryHistory(workerId),
    [workerId],
    {
      showErrorToast: true,
      immediate: !!workerId,
    }
  );
}

export function useSalarySummary() {
  return useApiCall(() => apiClient.getSalarySummary(), [], {
    showErrorToast: true,
  });
}

// Audit
export function useAuditLogs(params?: {
  user_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  summary?: boolean;
}) {
  return useApiCall(() => apiClient.getAuditLogs(params), [params], {
    showErrorToast: true,
  });
}

export function useAuditStatistics() {
  return useApiCall(() => apiClient.getAuditStatistics(), [], {
    showErrorToast: true,
  });
}
