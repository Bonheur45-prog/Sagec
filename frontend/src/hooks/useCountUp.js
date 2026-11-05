import { useState, useEffect } from 'react'

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Only starts when `start` is true — controlled externally (e.g. by useInView).
 * Uses easeOutQuart for a slow, satisfying deceleration.
 *
 * @param {number}  target   - The final number to count up to
 * @param {number}  duration - Animation duration in ms (default: 2000)
 * @param {boolean} start    - Whether to begin the animation
 * @returns {number} current animated count value
 */
export function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start || !target) return

    let startTime = null
    let animationFrame

    // Decelerates quickly — feels satisfying for stat reveals
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp

      const elapsed  = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = easeOutQuart(progress)

      setCount(Math.round(eased * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(target) // guarantee exact final value
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [start, target, duration])

  return count
}