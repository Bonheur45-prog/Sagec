import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@lib/api'

export const partnersQuery = () =>
  queryOptions({
    queryKey: ['partners'],
    queryFn: async () => {
      const res = await fetchCollection('partners', '?sort=order&limit=50&depth=1')
      return res.docs
    },
    // Decorative strip: it simply hides if this fails, so no error toast.
  })

/** All partners, in the CMS's configured display order. */
export function usePartners() {
  return useQuery(partnersQuery())
}
