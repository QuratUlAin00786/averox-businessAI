import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let json: Record<string, any> = {};
    try {
      json = await res.json();
      
      // Special handling for OpenAI API errors
      if (json.details && json.details.includes('quota')) {
        throw new Error('OpenAI API quota exceeded. Please check your plan and billing details.');
      } else if (json.details && json.details.includes('API Error')) {
        throw new Error(`OpenAI API Error: ${json.details}`);
      }
      
      // Support standardized response format
      if (json.success === false) {
        throw new Error(json.message || json.error || `${res.status}: API error`);
      }
      
      // Legacy error format support
      throw new Error(json.error || json.details || json.message || `${res.status}: API error`);
    } catch (e) {
      if (e instanceof Error && (json.error || json.details || json.message)) {
        throw e;
      }
      const text = await res.text() || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

// Network status tracking
let isOnline = navigator.onLine;
let networkChangeDetected = false;

// Function to check if error is network-related
function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'fetch',
    'network',
    'Failed to fetch',
    'NetworkError',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    'ERR_CONNECTION_REFUSED'
  ];
  
  return networkErrorMessages.some(msg => 
    error.message.toLowerCase().includes(msg.toLowerCase())
  ) || !isOnline;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`API Request: ${method} ${url}`, data);
  
  // Check network status
  if (!isOnline) {
    throw new Error('Network connection lost. Please check your internet connection.');
  }
  
  try {
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`API Response: ${method} ${url} - Status: ${res.status}`);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    if (error instanceof Error) {
      // Handle timeout errors
      if (error.name === 'AbortError') {
        console.error(`API Timeout: ${method} ${url}`);
        throw new Error('Request timeout. Please try again.');
      }
      
      // Handle network errors
      if (isNetworkError(error)) {
        console.error(`Network Error: ${method} ${url}`, error);
        throw new Error('Network error detected. Please check your connection and try again.');
      }
    }
    
    console.error(`API Error: ${method} ${url}`, error);
    throw error;
  }
}

// Types for standardized API responses
export interface StandardResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  metadata?: Record<string, any>;
  details?: any;
}

// Helper function to make API requests with JSON response
export async function apiRequestJson<T = any>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  const res = await apiRequest(method, url, data);
  const result = await res.json();
  
  // Handle both standardized and legacy response formats
  return (result.success !== undefined ? result.data : result) as T;
}

// Function to extract metadata from standardized responses
export async function apiRequestWithMetadata<T = any>(
  method: string,
  url: string,
  data?: unknown,
): Promise<{ data: T; metadata?: Record<string, any>; message?: string }> {
  const res = await apiRequest(method, url, data);
  const result = await res.json() as StandardResponse<T>;
  
  if (result.success !== undefined) {
    return {
      data: result.data as T,
      metadata: result.metadata,
      message: result.message
    };
  }
  
  // Legacy format doesn't have metadata, so return just the data
  return { data: result as T };
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`Making query request to: ${queryKey[0]}`);
    
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      console.log(`Query response from ${queryKey[0]} - Status: ${res.status}`);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Unauthorized access to ${queryKey[0]}, returning null`);
        return null;
      }

      await throwIfResNotOk(res);
      const result = await res.json();
      console.log(`Query data from ${queryKey[0]}:`, result);
      
      // Handle both standardized and legacy response formats
      return result.success !== undefined ? result.data : result;
    } catch (error) {
      console.error(`Query error for ${queryKey[0]}:`, error);
      throw error;
    }
  };

// Type-safe mutation function helper
export const createMutation = <TData = unknown, TError = Error, TVariables = unknown, TContext = unknown>() => {
  return {
    mutationFn: async (variables: TVariables) => {
      const { url, method, data } = variables as any;
      return apiRequestJson<TData>(method, url, data);
    }
  };
};

/**
 * Enhanced Query hook that returns both data and metadata from standardized API responses
 */
export function useEnhancedQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError, TData, any>
) {
  const { queryKey, queryFn, ...restOptions } = options;
  
  // Use the original useQuery but with a custom fetcher for the metadata
  return useQuery({
    queryKey,
    queryFn: async (context) => {
      // If custom queryFn is provided, use it
      if (queryFn && typeof queryFn === 'function') {
        const result = await queryFn(context);
        return result;
      }
      
      // Otherwise use our standardized fetcher with metadata
      try {
        const url = context.queryKey[0] as string;
        const result = await apiRequestWithMetadata<TData>("GET", url);
        
        // Store metadata in non-enumerable properties so they don't interfere with normal data usage
        if (result.data && typeof result.data === 'object') {
          Object.defineProperty(result.data, '_metadata', {
            value: result.metadata || {},
            enumerable: false,
            configurable: true
          });
          
          Object.defineProperty(result.data, '_message', {
            value: result.message || '',
            enumerable: false,
            configurable: true
          });
        }
        
        return result.data;
      } catch (error) {
        console.error('Enhanced query error:', error);
        throw error;
      }
    },
    ...restOptions
  });
}

/**
 * Extract metadata from a query result returned by useEnhancedQuery
 */
export function extractMetadata<T = any>(data: T | undefined): Record<string, any> | undefined {
  if (!data || typeof data !== 'object') return undefined;
  return (data as any)._metadata;
}

/**
 * Extract message from a query result returned by useEnhancedQuery
 */
export function extractMessage(data: any | undefined): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  return (data as any)._message;
}

// Enhanced mutation creator that can preserve metadata
export const createEnhancedMutation = <TData = unknown, TError = Error, TVariables = unknown, TContext = unknown>() => {
  return {
    mutationFn: async (variables: TVariables & { preserveMetadata?: boolean }) => {
      const { url, method, data, preserveMetadata } = variables as any;
      
      if (preserveMetadata) {
        const result = await apiRequestWithMetadata<TData>(method, url, data);
        
        // Store metadata in non-enumerable properties
        if (result.data && typeof result.data === 'object') {
          Object.defineProperty(result.data, '_metadata', {
            value: result.metadata || {},
            enumerable: false,
            configurable: true
          });
          
          Object.defineProperty(result.data, '_message', {
            value: result.message || '',
            enumerable: false,
            configurable: true
          });
        }
        
        return result.data;
      }
      
      return apiRequestJson<TData>(method, url, data);
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 60000, // 1 minute
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408 (timeout) and 429 (rate limit)
        if (error instanceof Error && error.message.includes('401')) return false;
        if (error instanceof Error && error.message.includes('403')) return false;
        if (error instanceof Error && error.message.includes('404')) return false;
        
        // Always retry on network errors up to 3 times
        if (error instanceof Error && isNetworkError(error)) {
          return failureCount < 3;
        }
        
        // Retry on 5xx errors
        if (error instanceof Error && error.message.match(/50\d/)) {
          return failureCount < 2;
        }
        
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Custom query key matching function to handle different caching strategies
      queryKeyHashFn: (queryKey) => {
        // For reports, include the current timestamp to prevent caching
        if (typeof queryKey[0] === 'string' && queryKey[0].includes('/api/reports/')) {
          // Create a unique hash that includes current time (in 2-second intervals)
          // This effectively disables caching while preventing multiple near-simultaneous requests
          const timeComponent = Math.floor(Date.now() / 2000);
          return `${queryKey[0]}_${timeComponent}`;
        }
        
        // For all other queries, use the default key serialization
        return JSON.stringify(queryKey);
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Set up network event listeners after query client is created
window.addEventListener('online', () => {
  isOnline = true;
  networkChangeDetected = true;
  console.log('Network connection restored');
  // Refetch all queries when coming back online
  queryClient.refetchQueries();
});

window.addEventListener('offline', () => {
  isOnline = false;
  networkChangeDetected = true;
  console.log('Network connection lost');
});
