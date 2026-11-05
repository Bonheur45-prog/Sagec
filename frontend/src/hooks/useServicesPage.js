import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchGlobal } from '@lib/api'

export const servicesPageQuery = () =>
  queryOptions({
    queryKey: ['services-page'],
    queryFn: () => fetchGlobal('services-page', '?depth=2'),
    meta: { errorMessage: 'Could not load page content. Please try again shortly.' },
  })

/**
 * Fetches the whole ServicesPage global once. ServicesHero, ServicesProcess,
 * and ServicesCTA all use this with a `select` — React Query dedupes
 * identical queryKeys, so this is a single network request no matter
 * how many sections use it.
 */
export function useServicesPage(select) {
  return useQuery({ ...servicesPageQuery(), select })
}