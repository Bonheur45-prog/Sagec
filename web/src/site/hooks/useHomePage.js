'use client';

import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchGlobal } from '@lib/api'

export const homePageQuery = () =>
  queryOptions({
    queryKey: ['home-page'],
    queryFn: () => fetchGlobal('home-page', '?depth=2'),
    meta: { errorMessage: 'Could not load page content. Please try again shortly.' },
  })

/**
 * Fetches the whole HomePage global once. Hero, Stats, the Services/
 * Projects/Testimonials teaser copy, WhyChooseUs, and the closing CTA
 * all use this with a `select` — React Query dedupes identical
 * queryKeys, so this is a single network request no matter how many
 * sections use it.
 */
export function useHomePage(select) {
  return useQuery({ ...homePageQuery(), select })
}
