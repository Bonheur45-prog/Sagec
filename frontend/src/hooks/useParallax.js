import { useRef, useState, useEffect } from 'react'

/**
 * Returns a [ref, offset] tuple.
 * `offset` is a pixel value (positive/negative) representing how far the
 * element's center has drifted from the viewport's vertical center,
 * scaled by `speed`. Apply it as translateY on a background layer inside
 * the element to get a smooth scroll-driven parallax effect that works
 * consistently across browsers (unlike background-attachment: fixed,
 * which iOS Safari doesn't support).
 *
 * @param {number} speed - Parallax intensity, roughly 0.1–0.4 is subtle/tasteful.
 */
export function useParallax(speed = 0.2) {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let rafId = null

    const update = () => {
      const el = ref.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const viewportCenter = window.innerHeight / 2
        const elementCenter = rect.top + rect.height / 2
        setOffset((elementCenter - viewportCenter) * speed)
      }
      rafId = null
    }

    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [speed])

  return [ref, offset]
}