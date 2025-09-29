// API Configuration
export const API_CONFIG = {
  // Base URL for your backend API - update this to match your backend server
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  
  // API endpoints
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
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
