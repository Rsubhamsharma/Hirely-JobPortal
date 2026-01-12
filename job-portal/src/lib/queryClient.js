import { QueryClient } from '@tanstack/react-query';

// Create a QueryClient with sensible defaults
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Keep data fresh for 30 seconds before marking stale
            staleTime: 30 * 1000,
            // Cache data for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests up to 2 times
            retry: 2,
            // Refetch when window regains focus
            refetchOnWindowFocus: true,
        },
    },
});
