import { useState, useEffect } from 'react'

/**
 * Returns true when the page has scrolled past the given threshold.
 * Used by Navbar to switch from transparent → solid.
 */
export function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }

    // Set initial state
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}
