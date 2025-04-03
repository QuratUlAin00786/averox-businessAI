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
      
      throw new Error(json.error || json.details || `${res.status}: API error`);
    } catch (e) {
      if (e instanceof Error && (json.error || json.details)) {
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
  return await res.json();
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
      const data = await res.json();
      console.log(`Query data from ${queryKey[0]}:`, data);
      return data;
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
    },
    mutations: {
      retry: false,
    },
  },
});
