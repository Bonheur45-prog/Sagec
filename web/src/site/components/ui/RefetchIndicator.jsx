'use client';

import { useEffect, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import styles from './RefetchIndicator.module.css'

/**
 * Thin bar at the very top of the viewport that appears whenever any
 * query is fetching — most importantly, the SILENT background refetch
 * that follows rehydrating stale data from the persisted cache (see
 * src/lib/persister.js). Without this, a content edit made in the CMS
 * can appear to "flicker" a moment after a page loads, with no visual
 * explanation. This gives that moment a legible reason: the bar says
 * "checking for the latest content," so a changing value reads as
 * freshness, not a glitch.
 *
 * Mounted once, globally, in main.jsx — no per-page wiring needed.
 * useIsFetching() reports the count of in-flight queries across the
 * WHOLE app, not just one hook's — this intentionally covers first
 * loads and normal navigation too, not only persistence-triggered
 * refetches; consistent "there's network activity" feedback is worth
 * more than narrowly scoping it to one cause.
 */
export default function RefetchIndicator() {
  const isFetching = useIsFetching()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isFetching > 0) {
      // Small delay before showing — avoids a flash for fetches that
      // resolve in well under a human-perceptible amount of time.
      const showTimer = setTimeout(() => setVisible(true), 150)
      return () => clearTimeout(showTimer)
    }
    setVisible(false)
  }, [isFetching])

  return (
    <div
      className={`${styles.bar} ${visible ? styles.visible : ''}`}
      role="status"
      aria-live="polite"
      aria-label={visible ? 'Checking for updated content' : undefined}
    />
  )
}