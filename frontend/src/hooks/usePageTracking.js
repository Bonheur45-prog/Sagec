import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Sends a Google Analytics page_view on every route change.
 * The base gtag snippet in index.html has send_page_view: false, so this hook
 * is the only source of page views (no double counting).
 *
 * The short delay lets react-helmet-async (<Seo />) update document.title
 * first, so GA records the real page title instead of the previous one.
 */
export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window.gtag !== 'function') return

    const timer = setTimeout(() => {
      window.gtag('event', 'page_view', {
        page_path:     location.pathname + location.search,
        page_location: window.location.href,
        page_title:    document.title,
      })
    }, 150)

    return () => clearTimeout(timer)
  }, [location.pathname, location.search])
}
