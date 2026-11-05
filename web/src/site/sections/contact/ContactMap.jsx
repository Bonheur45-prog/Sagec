'use client';

import { motion } from 'framer-motion'
import { useContactPage } from '@hooks/useContactPage'
import styles from './ContactMap.module.css'

export default function ContactMap() {
  const { data: map, isLoading, isError } = useContactPage((page) => page.map)

  if (isLoading || isError || !map) return null

  return (
    <section className={styles.section} aria-label="SAGEC office location">

      {/* Label strip above map */}
      <motion.div
        className={styles.strip}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.stripInner}>
          <div className={styles.stripPin} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#F26522"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
          <span className={styles.stripText}>{map.label}</span>
        </div>
      </motion.div>

      {/* Map embed */}
      <div className={styles.mapWrapper}>
        <iframe
          className={styles.map}
          title={map.title ? `${map.title} office location` : 'SAGEC Ltd office location'}
          src={map.embedSrc}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Overlay card on map */}
        <div className={styles.mapCard}>
          <p className={styles.mapCardTitle}>{map.title}</p>
          <p className={styles.mapCardSub}>{map.subtitle}</p>
          <div className={styles.mapCardDivider} aria-hidden="true" />
          <a
            href={map.directionsLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapCardLink}
          >
            {map.directionsLabel} →
          </a>
        </div>
      </div>

    </section>
  )
}
