import { QueryClient, QueryCache } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Single shared QueryClient for the whole app (imported by main.jsx).
 *
 * Error handling lives here, not per-hook: TanStack Query v5 removed
 * the onError callback from useQuery itself (it fired once per component
 * instance, which meant duplicate toasts for the same failed request).
 * A QueryCache-level onError fires exactly once per failed query,
 * regardless of how many components are subscribed to it.
 *
 * Individual hooks can customize the toast message via:
 *   useQuery({ ..., meta: { errorMessage: 'Could not load X.' } })
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const message = query.meta?.errorMessage || 'Something went wrong loading this content.'
      toast.error(message)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes — content doesn't change every second
      gcTime: 1000 * 60 * 30, // 30 minutes — stale data still renders instantly on
      // return visits within a session, refetching silently in the background,
      // instead of being evicted right when it goes stale and forcing a loader
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})