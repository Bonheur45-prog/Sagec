'use client';

import { useQueryClient } from '@tanstack/react-query'

/**
 * Returns a `prefetch(queryOptions)` function for hover-to-prefetch UX.
 *
 * Call it from onMouseEnter (and onFocus, for keyboard/touch users who
 * never trigger a mouse hover) on any link to a detail page:
 *
 *   const prefetch = usePrefetch()
 *   <Link
 *     to={`/projects/${project.slug}`}
 *     onMouseEnter={() => prefetch(projectQuery(project.slug))}
 *     onFocus={() => prefetch(projectQuery(project.slug))}
 *   >
 *
 * By the time the click actually lands, the data is often already in
 * the cache — the detail page renders instantly instead of showing a
 * loader. queryClient.prefetchQuery is a safe no-op if the query is
 * already fresh, so calling this on every hover (including repeat
 * hovers over the same card) costs nothing extra.
 */
export function usePrefetch() {
  const queryClient = useQueryClient()
  return (options) => {
    queryClient.prefetchQuery(options)
  }
}