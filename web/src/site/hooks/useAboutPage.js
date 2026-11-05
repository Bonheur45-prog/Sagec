'use client';

import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchGlobal } from '@lib/api'

export const aboutPageQuery = () =>
  queryOptions({
    queryKey: ['about-page'],
    queryFn: () => fetchGlobal('about-page', '?depth=2'),
    meta: { errorMessage: 'Could not load page content. Please try again shortly.' },
  })

/**
 * Fetches the whole AboutPage global once. AboutHero, OurStory,
 * MissionVision, Timeline, and AboutCTA all use this with a `select`
 * — one request, same dedupe pattern as useServicesPage/useHomePage.
 */
export function useAboutPage(select) {
  return useQuery({ ...aboutPageQuery(), select })
}
