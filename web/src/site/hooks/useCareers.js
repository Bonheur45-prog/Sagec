'use client';

import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchGlobal } from '@lib/api'

// The CMS only returns jobs with status "open" to the public, so no
// status filter is needed here.
export const jobsQuery = () =>
  queryOptions({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await fetchCollection('jobs', '?sort=order&limit=100&depth=0')
      return res.docs
    },
    meta: { errorMessage: 'Could not load job openings. Please try again shortly.' },
  })

export const careersPageQuery = () =>
  queryOptions({
    queryKey: ['careers-page'],
    queryFn: () => fetchGlobal('careers-page'),
    meta: { errorMessage: 'Could not load page content. Please try again shortly.' },
  })

/** Open job listings, in the CMS's configured display order. */
export function useJobs() {
  return useQuery(jobsQuery())
}

/** Hero, how-to-apply and empty-state copy for the Careers page. */
export function useCareersPage(select) {
  return useQuery({ ...careersPageQuery(), select })
}
