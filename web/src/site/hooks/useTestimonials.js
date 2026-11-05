'use client';

import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchGlobal } from '@lib/api'

export const testimonialsQuery = () =>
  queryOptions({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const res = await fetchCollection('testimonials', '?sort=order&limit=100&depth=1')
      return res.docs
    },
    meta: { errorMessage: 'Could not load testimonials. Please try again shortly.' },
  })

export const testimonialsPageQuery = () =>
  queryOptions({
    queryKey: ['testimonials-page'],
    queryFn: () => fetchGlobal('testimonials-page'),
    meta: { errorMessage: 'Could not load page content. Please try again shortly.' },
  })

/** All testimonials, in the CMS's configured display order — used by both the Home teaser and the full Testimonials page. */
export function useTestimonials(select) {
  return useQuery({ ...testimonialsQuery(), select })
}

/** Hero copy for the dedicated Testimonials page. */
export function useTestimonialsPage(select) {
  return useQuery({ ...testimonialsPageQuery(), select })
}
