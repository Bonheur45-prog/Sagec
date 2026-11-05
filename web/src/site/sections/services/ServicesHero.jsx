'use client';

import { Link } from '@site/router'
import { motion } from 'framer-motion'
import { useServicesPage } from '@hooks/useServicesPage'
import { mediaURL } from '@lib/api'
import styles from './ServicesHero.module.css'

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export default function ServicesHero() {
  // Chrome text with a fallback per field, not a loading skeleton —
  // this is short, generic, on-brand copy that's correct (or near
  // enough) even before the real content arrives, so there's no flash
  // of an empty hero on first load. See useProjects.js's PROJECT_
  // CATEGORIES comment for why data-bearing arrays (the actual service
  // list below) get a real skeleton instead — a wrong fallback NUMBER
  // or LIST would be misleading; a generic fallback HEADLINE isn't.
  const { data: hero } = useServicesPage((page) => page.hero)

  return (
    <section className={styles.hero} aria-label="Our Services">

      {/* Background */}
      <div className={styles.background} aria-hidden="true">
        <img
          src={mediaURL(hero?.backgroundImage?.url) || '/images/services/services-bg.jpeg'}
          alt=""
          className={styles.bgImage}
        />
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div className={styles.contentWrapper}>
        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Breadcrumb */}
          <motion.nav
            className={styles.breadcrumb}
            variants={itemVariants}
            aria-label="Breadcrumb"
          >
            <Link to="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
            <span className={styles.breadcrumbCurrent}>Services</span>
          </motion.nav>

          {/* Eyebrow */}
          <motion.p className={styles.eyebrow} variants={itemVariants}>
            {hero?.eyebrow ?? 'What We Offer'}
          </motion.p>

          {/* Headline */}
          <motion.h1 className={styles.headline} variants={itemVariants}>
            {hero?.headline ?? 'Our Services'}
          </motion.h1>

          {/* Accent line */}
          <motion.div
            className={styles.accentLine}
            variants={{
              hidden:  { scaleX: 0 },
              visible: {
                scaleX: 1,
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
              },
            }}
            style={{ transformOrigin: 'left' }}
            aria-hidden="true"
          />

          {/* Subline */}
          <motion.p className={styles.subline} variants={itemVariants}>
            {hero?.subline ??
              'From architectural design to full construction management — every discipline under one roof.'}
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        aria-hidden="true"
      >
        <motion.span
          className={styles.scrollLine}
          style={{ transformOrigin: 'top' }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: 1.4 }}
        />
      </motion.div>

    </section>
  )
}