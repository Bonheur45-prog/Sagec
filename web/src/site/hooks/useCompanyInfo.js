'use client';

import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchGlobal } from '@lib/api'

export const companyInfoQuery = () =>
  queryOptions({
    queryKey: ['company-info'],
    queryFn: () => fetchGlobal('company-info'),
    // Contact details are used site-wide (Footer, MobileDrawer, CTASection,
    // Contact page) — cache it for longer since it changes rarely.
    staleTime: 5 * 60 * 1000,
    meta: { errorMessage: 'Could not load contact details. Please try again shortly.' },
  })

/** Single source of truth for phone/email/address/hours/socials — feeds the Footer, nav drawer, CTAs, and Contact page. */
export function useCompanyInfo(select) {
  return useQuery({ ...companyInfoQuery(), select })
}
