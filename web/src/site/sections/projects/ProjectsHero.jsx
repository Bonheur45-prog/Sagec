'use client';

import { Link } from '@site/router'
import { motion } from 'framer-motion'
import { useProjectsPage } from '@hooks/useProjects'
import styles from './ProjectsHero.module.css'

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const MAX_HEADLINE_LINE2 = 40

export default function ProjectsHero() {
  const { data: hero } = useProjectsPage((page) => page.projectsHero)

  // Headline line 2 is meant to be a short second line (e.g. "Built to Last").
  // If a long sentence was entered there, it's really the subline — keep it out
  // of the giant <h1> and show it as the subline instead.
  const line2 = hero?.headlineLine2?.trim() ?? ''
  const line2IsHeadline = line2.length > 0 && line2.length <= MAX_HEADLINE_LINE2
  const subline =
    hero?.subline?.trim() ||
    (line2 && !line2IsHeadline ? line2 : "Bringing Rwanda's most ambitious visions to life — one landmark project at a time.")

  return (
    <section className={styles.hero} aria-label="Our Projects">

      {/* Background */}
      <div className={styles.background} aria-hidden="true">
        <img
          src="/images/projects/projects-hero.webp"
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
            <span className={styles.breadcrumbCurrent}>Projects</span>
          </motion.nav>

          <motion.p className={styles.eyebrow} variants={itemVariants}>
            {hero?.eyebrow ?? 'Our Portfolio'}
          </motion.p>

          <motion.h1 className={styles.headline} variants={itemVariants}>
            {hero?.headlineLine1 ?? 'Our Projects'}
            {line2IsHeadline && (<><br />{line2}</>)}
          </motion.h1>

          <motion.div
            className={styles.accentLine}
            style={{ transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
            aria-hidden="true"
          />

          <motion.p className={styles.subline} variants={itemVariants}>
            {subline}
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