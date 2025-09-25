"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, User, LoginCredentials, TokenManager } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const tokenManager = TokenManager.getInstance();

  const isAuthenticated = !!user && tokenManager.isAuthenticated();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if we have stored user data and tokens
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      if (storedUser && tokenManager.isAuthenticated()) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Verify token is still valid by fetching current user
        const response = await apiClient.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          // Update stored user data
          localStorage.setItem('user', JSON.stringify(response.data));
          localStorage.setItem('userRole', response.data.role);
        } else {
          // Token is invalid, clear auth state
          clearAuthState();
        }
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.user.username}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: response.error || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthState();
    apiClient.logout();
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('userRole', response.data.role);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const clearAuthState = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
