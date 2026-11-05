import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchGlobal } from '@lib/api'

export const seoSettingsQuery = () =>
  queryOptions({
    queryKey: ['seo-settings'],
    queryFn: () => fetchGlobal('seo-settings', '?depth=1'),
    staleTime: 5 * 60 * 1000,
    // SEO is never worth a user-facing error toast — pages fall back to
    // the text written in the page file when this can't load.
  })

/** The SEO Settings global, once, shared by every <Seo pageKey="..." />. */
export function useSeoSettings(enabled = true) {
  return useQuery({ ...seoSettingsQuery(), enabled })
}
