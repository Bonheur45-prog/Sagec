import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useServices, serviceQuery } from '@hooks/useServices'
import { usePrefetch } from '@hooks/usePrefetch'
import { mediaURL } from '@lib/api'
import styles from './ServicesList.module.css'

// ── ANIMATION VARIANTS ─────────────────────────────────────

const slideLeft = {
  hidden:  { opacity: 0, x: -56 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const slideRight = {
  hidden:  { opacity: 0, x: 56 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const slideUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

// ── CHECKMARK ICON ─────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="#F26522" strokeWidth="1.4"/>
      <path d="M5 8l2 2 4-4" stroke="#F26522" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── INDIVIDUAL SERVICE BLOCK ───────────────────────────────

function ServiceBlock({ service, index }) {
  const prefetch = usePrefetch()
  const isOdd   = index % 2 === 0        // odd index = image left
  const bgClass = isOdd ? styles.bgLight : styles.bgGrey
  const number  = String(index + 1).padStart(2, '0')

  return (
    <div
      className={`${styles.block} ${bgClass}`}
      id={service.slug}
    >
      <div className={styles.blockInner}>

        {/* ── IMAGE ─────────────────────── */}
        <motion.div
          className={`${styles.imageCol} ${isOdd ? styles.imageLeft : styles.imageRight}`}
          variants={isOdd ? slideLeft : slideRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className={styles.imageWrapper}>
            <img
              src={mediaURL(service.image?.url)}
              alt={service.title}
              className={styles.image}
              loading="lazy"
            />
            {/* Orange number badge */}
            <div className={styles.numberBadge} aria-hidden="true">
              {number}
            </div>
          </div>
        </motion.div>

        {/* ── CONTENT ───────────────────── */}
        <motion.div
          className={styles.contentCol}
          variants={isOdd ? slideRight : slideLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {/* Eyebrow */}
          <p className={styles.eyebrow}>Service {number}</p>

          {/* Title */}
          <h2 className={styles.title}>{service.title}</h2>

          {/* Accent line */}
          <div className={styles.accentLine} aria-hidden="true" />

          {/* Description */}
          <p className={styles.description}>{service.description}</p>

          {/* Deliverables list — CMS models this as [{id, text}], not
              plain strings like the old static data did */}
          <motion.ul
            className={styles.deliverables}
            variants={{
              hidden:  {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {(service.deliverables ?? []).map((item, i) => (
              <motion.li
                key={item.id ?? i}
                className={styles.deliverable}
                variants={slideUp}
              >
                <span className={styles.checkIcon}><CheckIcon /></span>
                <span>{item.text}</span>
              </motion.li>
            ))}
          </motion.ul>

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
        </motion.div>

      </div>
    </div>
  )
}

// ── LOADING SKELETON ────────────────────────────────────────
// A real skeleton, not a fallback list — an empty/wrong service
// lineup would be actively misleading, unlike short generic chrome
// text (see ServicesHero.jsx's comment on this same distinction).

function ServicesSkeleton() {
  return (
    <div className={styles.wrapper}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`${styles.block} ${i % 2 === 0 ? styles.bgLight : styles.bgGrey}`}>
          <div className={styles.blockInner}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine} style={{ width: '30%' }} />
              <div className={styles.skeletonLine} style={{ width: '60%', height: '1.8rem' }} />
              <div className={styles.skeletonLine} style={{ width: '90%' }} />
              <div className={styles.skeletonLine} style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────

export default function ServicesList() {
  const { data: services, isLoading, isError, error } = useServices()

  if (isLoading) return <ServicesSkeleton />

  if (isError) {
    return (
      <p className={styles.errorText}>
        Couldn&apos;t load services right now ({error.message}).
      </p>
    )
  }

  return (
    <div className={styles.wrapper}>
      {(services ?? []).map((service, index) => (
        <ServiceBlock key={service.id} service={service} index={index} />
      ))}
    </div>
  )
}