import { QueryClient, QueryFunction } from "@tanstack/react-query";

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

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`API Request: ${method} ${url}`, data);
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`API Response: ${method} ${url} - Status: ${res.status}`);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Error: ${method} ${url}`, error);
    throw error;
  }
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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      retry: false,
      
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
