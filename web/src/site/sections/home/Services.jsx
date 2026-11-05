'use client';

import { useRef } from 'react'
import { Link } from '@site/router'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from '@hooks/useInView'
import { useServices, serviceQuery } from '@hooks/useServices'
import { useHomePage } from '@hooks/useHomePage'
import { usePrefetch } from '@hooks/usePrefetch'
import { mediaURL } from '@lib/api'
import styles from './Services.module.css'

// ── ANIMATION VARIANTS ─────────────────────────────────────

const headingVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

const gridVariants = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

// Service card reveal animation removed for faster render and lower runtime work.
function getResponsiveImageSizes() {
  return '(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw'
}

function buildResponsiveSrcSet(imagePath) {
  return `${imagePath} 480w, ${imagePath} 768w, ${imagePath} 1024w, ${imagePath} 1280w`
}

const ctaVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

// ── SERVICE ICONS ──────────────────────────────────────────

const icons = {
  architecture: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21h18M3 21V7l9-4 9 4v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  structure: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="18" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="10" y="2" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="18" y="18" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 18L12 6M20 18L12 6M6 18h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  mep: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2a5 5 0 0 1 5 5c0 3-5 8-5 8S7 10 7 7a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
      <path d="M5 20h14M8 20v-4h8v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  management: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 4V2M16 4V2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 13h4M7 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="17" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M17 12v-.5M17 17v-.5M19.5 14.5h.5M14.5 14.5h-.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  construction: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 20h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4 20V10l8-6 8 6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="6" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9 10h6M12 7v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  interior: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M7 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M2 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M11 8h7M11 12h5M11 16h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
}

// ── SERVICE CARD ───────────────────────────────────────────

function ServiceCard({ service }) {
  const prefetch = usePrefetch()
  const imageUrl = mediaURL(service.image?.url)

  return (
    <article className={styles.card}>
      {/* Photo thumbnail */}
      <div className={styles.photoWrapper}>
        <picture>
          <img
            src={imageUrl}
            srcSet={buildResponsiveSrcSet(imageUrl)}
            sizes={getResponsiveImageSizes()}
            alt={service.title}
            className={styles.photo}
            loading="lazy"
            decoding="async"
            importance="low"
            fetchpriority="low"
          />
        </picture>
        {/* Subtle orange bottom edge on hover */}
        <div className={styles.photoAccent} />
      </div>

      {/* Card body */}
      <div className={styles.cardBody}>

        {/* Title row: icon + title */}
        <div className={styles.titleRow}>
          <span className={styles.icon}>
            {icons[service.iconKey]}
          </span>
          <h3 className={styles.title}>{service.title}</h3>
        </div>

        {/* Orange divider */}
        <div className={styles.divider} />

        {/* Description */}
        <p className={styles.description}>{service.description}</p>

        {/* CTA */}
        <Link
          to={`/services/${service.slug}`}
          className={styles.cta}
          onMouseEnter={() => prefetch(serviceQuery(service.slug))}
          onFocus={() => prefetch(serviceQuery(service.slug))}
        >
          Learn More
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.ctaArrow}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

      </div>
    </article>
  )
}

// ── LOADING SKELETON ────────────────────────────────────────
// The card grid is real data (titles, icons, descriptions) — a
// skeleton, not a guessed fallback list. See ServicesList.jsx for
// the same reasoning applied to the full Services page.

function ServicesSkeleton() {
  return (
    <div className={styles.grid}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`${styles.card} ${styles.cardSkeleton}`} />
      ))}
    </div>
  )
}

// ── MAIN SERVICES SECTION ──────────────────────────────────

export default function ServicesOverview() {
  const sectionRef = useRef(null)
  const [inViewRef, inView] = useInView({ threshold: 0.08 })
  // Only the services ticked “Show on the home page” in the CMS.
  const { data: services, isLoading, isError, error } = useServices((list) => list.filter((s) => s.showOnHome !== false))
  const { data: teaser } = useHomePage((home) => home.servicesTeaser)

  // Parallax: background moves slower than scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])

  const setRefs = (el) => {
    sectionRef.current = el
    inViewRef.current = el
  }

  return (
    <section
      ref={setRefs}
      className={styles.section}
      aria-labelledby="services-heading"
    >
      {/* ── PARALLAX BACKGROUND ─────────────── */}
      <motion.div
        className={styles.parallaxBg}
        style={{ y: backgroundY }}
        aria-hidden="true"
      >
        <div className={styles.bgImage} />
        <div className={styles.bgOverlay} />
      </motion.div>

      {/* ── CONTENT ─────────────────────────── */}
      <div className={styles.content}>

        {/* Header */}
        <motion.div
          className={styles.header}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={headingVariants}
        >
          <span className={styles.eyebrow}>{teaser?.eyebrow ?? 'What We Offer'}</span>
          <h2 id="services-heading" className={styles.heading}>
            {teaser?.heading ?? 'Our Services'}
          </h2>
          <p className={styles.subheading}>
            From groundbreaking architecture to precision engineering —
            SAGEC delivers end-to-end solutions across every discipline.
          </p>
        </motion.div>

        {/* Services grid */}
        {isLoading && <ServicesSkeleton />}

        {isError && (
          <p className={styles.errorText}>
            Couldn&apos;t load services right now ({error.message}).
          </p>
        )}

        {services && (
          <motion.div
            className={styles.grid}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={gridVariants}
          >
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={ctaVariants}
        >
          <Link to={teaser?.viewAllLink ?? '/services'} className={styles.viewAllBtn}>
            {teaser?.viewAllLabel ?? 'View All Services'}
          </Link>
        </motion.div>

      </div>
    </section>
  )
}