'use client';

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './ProjectGallery.module.css'

/**
 * Project photos as a centred carousel: the current photo large in the middle with its caption,
 * the neighbours peeking on both sides (click them to move), round arrows on the edges and dots below.
 * Works with the keyboard (← →) and by swiping on phones.
 *
 * slides: [{ src, alt }] — heading/eyebrow/title/location come from the project and CMS → Pages → Projects.
 */
export default function ProjectGallery({ slides, heading = 'Gallery', title, location }) {
  const [current, setCurrent] = useState(0)
  const count = slides?.length ?? 0
  const touch = useRef(null)

  const go = useCallback((i) => setCurrent(((i % count) + count) % count), [count])
  const prev = useCallback(() => go(current - 1), [go, current])
  const next = useCallback(() => go(current + 1), [go, current])

  // Load the photos either side ahead of time, so moving never shows an empty frame.
  useEffect(() => {
    if (count < 2) return
    for (const i of [current - 1, current + 1]) {
      const img = new Image()
      img.src = slides[((i % count) + count) % count].src
    }
  }, [current, count, slides])

  if (!count) return null

  // Position of each slide relative to the current one, the short way round (…, -1, 0, +1, …).
  const offsetOf = (i) => {
    let d = i - current
    if (d > count / 2) d -= count
    if (d < -count / 2) d += count
    return d
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    if (e.key === 'ArrowRight') { e.preventDefault(); next() }
  }
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touch.current === null) return
    const dx = e.changedTouches[0].clientX - touch.current
    if (Math.abs(dx) > 40) (dx > 0 ? prev : next)()
    touch.current = null
  }

  const [first, ...rest] = String(title ?? '').split(' ')

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h2 className={styles.heading}>{heading}</h2>
        {title && (
          <p className={styles.sub}>
            Explore <span className={styles.accent}>{title}</span>
            {location ? ` in ${location}` : ''}
          </p>
        )}
      </header>

      <div
        className={styles.stage}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title ?? 'Project'} photos`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((s, i) => {
          const d = offsetOf(i)
          const pos = d === 0 ? 'center' : d === -1 ? 'left' : d === 1 ? 'right' : d < 0 ? 'farLeft' : 'farRight'
          return (
            <figure
              key={`${s.src}-${i}`}
              className={styles.slide}
              data-pos={pos}
              aria-hidden={d !== 0}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              onClick={d === -1 ? prev : d === 1 ? next : undefined}
            >
              <img
                src={s.src}
                alt={s.alt || `${title ?? 'Project'} — photo ${i + 1}`}
                className={styles.img}
                loading={Math.abs(d) <= 1 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />
              {d === 0 && title && (
                <figcaption className={styles.caption}>
                  <span className={styles.captionTitle}>
                    {first} {rest.length > 0 && <strong>{rest.join(' ')}</strong>}
                  </span>
                  {location && <span className={styles.captionPlace}>{location}</span>}
                </figcaption>
              )}
            </figure>
          )
        })}

        {count > 1 && (
          <>
            <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous photo">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next photo">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className={styles.dots} role="group" aria-label="Choose a photo">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.dot}
              data-active={i === current || undefined}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
      <p className={styles.srOnly} aria-live="polite">Photo {current + 1} of {count}</p>
    </div>
  )
}
