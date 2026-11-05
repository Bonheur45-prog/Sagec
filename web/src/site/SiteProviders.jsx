'use client';

import { useState } from 'react'
import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { getQueryClient } from '@lib/queryClient'
import { SiteChromeContext } from '@components/layout/site-chrome'
import Layout from '@components/layout/Layout'
import RefetchIndicator from '@components/ui/RefetchIndicator'

/**
 * Wraps every public page: the content cache (filled by the server for each page), the menu/footer
 * content from the CMS, the header + footer frame, and the little toast messages.
 */
export default function SiteProviders({ chrome, state, children }) {
  const [client] = useState(getQueryClient)
  return (
    <QueryClientProvider client={client}>
      <SiteChromeContext.Provider value={chrome}>
        {/* Company details used by the menu and footer, filled by the server like the page content. */}
        <HydrationBoundary state={state}>
          <RefetchIndicator />
          <Layout>{children}</Layout>
        </HydrationBoundary>
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{ style: { fontFamily: 'var(--font-body)', borderRadius: 'var(--radius-sm)' } }}
        />
      </SiteChromeContext.Provider>
    </QueryClientProvider>
  )
}
