import { QueryClient, QueryCache } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Error handling lives here, not per-hook: a QueryCache-level onError fires exactly once per failed
 * query, regardless of how many components are subscribed to it. Hooks can set the toast text with
 * useQuery({ ..., meta: { errorMessage: 'Could not load X.' } }).
 *
 * Pages arrive with their content already in the cache (filled by the server), so nothing is fetched
 * on first load; content counts as fresh for 5 minutes.
 */
export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (typeof window === 'undefined') return
        const message = query.meta?.errorMessage || 'Something went wrong loading this content.'
        toast.error(message)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserClient = null

/** One client per visit in the browser; a fresh one for every page render on the server (no data shared between visitors). */
export function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserClient) browserClient = makeQueryClient()
  return browserClient
}
