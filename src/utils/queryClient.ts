
import { QueryClient } from "@tanstack/react-query";

// Create query client with error handling compatible with @tanstack/react-query v5+
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    }
  },
});
