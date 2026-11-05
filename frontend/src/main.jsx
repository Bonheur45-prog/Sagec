import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Toaster } from 'sonner'
import { queryClient } from '@lib/queryClient'
import { persistOptions } from '@lib/persister'
import RefetchIndicator from '@components/ui/RefetchIndicator'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <RefetchIndicator />
        <App />
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              borderRadius: 'var(--radius-sm)',
            },
          }}
        />
      </PersistQueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)