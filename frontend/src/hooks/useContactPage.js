import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchGlobal } from '@lib/api'

export const contactPageQuery = () =>
  queryOptions({
    queryKey: ['contact-page'],
    queryFn: () => fetchGlobal('contact-page', '?depth=2'),
    meta: { errorMessage: 'Could not load page content. Please try again shortly.' },
  })

/** Fetches the whole ContactPage global once — hero, form copy, and map. */
export function useContactPage(select) {
  return useQuery({ ...contactPageQuery(), select })
}
