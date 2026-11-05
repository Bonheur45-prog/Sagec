'use client';

import { Link } from '@site/router'
import { motion } from 'framer-motion'
import { useAboutPage } from '@hooks/useAboutPage'
import { mediaURL } from '@lib/api'
import styles from './AboutHero.module.css'

// ── ANIMATION VARIANTS ─────────────────────────────────────
const containerVariants = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function AboutHero() {
  const { data: hero, isLoading, isError } = useAboutPage((about) => about.hero)

  if (isLoading || isError || !hero) return null

  return (
    <section className={styles.hero} aria-label="About SAGEC">

      {/* Background image + overlay */}
      <div className={styles.background} aria-hidden="true">
        <img
          src={mediaURL(hero.backgroundImage?.url)}
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
            <Link to="/" className={styles.breadcrumbHome}>Home</Link>
            <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
            <span className={styles.breadcrumbCurrent}>About Us</span>
          </motion.nav>

          {/* Eyebrow */}
          <motion.p className={styles.eyebrow} variants={itemVariants}>
            {hero.eyebrow}
          </motion.p>

          {/* Headline */}
          <motion.h1 className={styles.headline} variants={itemVariants}>
            {hero.headline}
          </motion.h1>

          {/* Orange accent line */}
          <motion.div
            className={styles.accentLine}
            variants={{
              hidden:  { scaleX: 0, originX: 0 },
              visible: {
                scaleX: 1,
                originX: 0,
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
              },
            }}
            aria-hidden="true"
          />

          {/* Subline */}
          <motion.p className={styles.subline} variants={itemVariants}>
            {hero.subline}
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
