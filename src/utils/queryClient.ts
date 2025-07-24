
import { QueryClient } from "@tanstack/react-query";

// Create query client with optimized error handling and caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry 406 errors (Not Acceptable) - these are expected
        if (error && typeof error === 'object' && 'status' in error && error.status === 406) {
          return false;
        }
        // Don't retry auth errors
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Prevent refetch on mount if data exists
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
    },
    mutations: {
      retry: 1,
    }
  },
});
