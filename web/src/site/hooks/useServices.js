'use client';

import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@lib/api'

// Exported as factories so onMouseEnter prefetch calls and the actual
// useQuery hooks below share one definition — see useProjects.js for
// the fuller rationale.

export const servicesQuery = () =>
  queryOptions({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetchCollection('services', '?sort=order&limit=100&depth=1')
      return res.docs
    },
    meta: { errorMessage: 'Could not load services. Please try again shortly.' },
  })

export const serviceQuery = (slug) =>
  queryOptions({
    queryKey: ['services', slug],
    queryFn: async () => {
      const res = await fetchCollection(
        'services',
        `?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
      )
      return res.docs[0] ?? null
    },
    enabled: Boolean(slug),
    meta: { errorMessage: 'Could not load this service. Please try again shortly.' },
  })

/**
 * Fetches the Services collection, sorted by the `order` field, with
 * depth=1 so image/detailImage relationships resolve to real URLs
 * instead of bare ids.
 */
export function useServices(select) {
  return useQuery({ ...servicesQuery(), select })
}

/**
 * Fetches a single Service by slug, for the detail page.
 * Returns `data: null` (not undefined, not an error) when no service
 * matches — callers should treat that as "genuinely not found" and
 * distinguish it from `isLoading`/`isError`, which mean something
 * different (still fetching / the request itself failed).
 */
export function useService(slug) {
  return useQuery(serviceQuery(slug))
}