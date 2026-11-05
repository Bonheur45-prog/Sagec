import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from '@hooks/useInView'
import { useParallax } from '@hooks/useParallax'
import { useTestimonials } from '@hooks/useTestimonials'
import { useHomePage } from '@hooks/useHomePage'
import TestimonialCard from '@components/TestimonialCard/TestimonialCard'
import styles from './Testimonials.module.css'

const PAGE_SIZE = 4

// Same per-card stagger fix as the dedicated Testimonials page grid —
// see sections/testimonials/TestimonialsGrid.jsx for the full explanation.
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function HomeTestimonials() {
  const [sectionRef, inView] = useInView(0.15)
  const [parallaxRef, parallaxOffset] = useParallax(0.15)
  const [page, setPage] = useState(0)

  const { data: testimonials, isLoading, isError } = useTestimonials()
  const { data: teaser } = useHomePage((home) => home.testimonialsTeaser)

  const totalPages = Math.ceil((testimonials?.length ?? 0) / PAGE_SIZE)

  const visible = useMemo(() => {
    if (!testimonials) return []
    const start = page * PAGE_SIZE
    return testimonials.slice(start, start + PAGE_SIZE)
  }, [testimonials, page])

  const goPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages)
  const goNext = () => setPage((p) => (p + 1) % totalPages)

  if (isLoading || isError || !testimonials?.length) return null

  return (
    <section className={styles.section} ref={parallaxRef} aria-labelledby="testimonials-heading">
      <div className={styles.background} aria-hidden="true">
        <div
          className={styles.bgImage}
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        />
        <div className={styles.overlay} />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={`${styles.textPanel} fade-in-up ${inView ? 'is-visible' : ''}`}>
          <span className={styles.eyebrow}>{teaser?.eyebrow ?? 'Testimonials'}</span>
          <h2 id="testimonials-heading" className={styles.heading}>
            {teaser?.heading ?? "Trusted By Rwanda\u2019s Leading Developers"}
          </h2>
          <p className={styles.description}>
            {teaser?.description ??
              'From first consultation to final handover, our clients trust SAGEC to deliver with precision, transparency, and lasting quality — here is what a few of them have to say.'}
          </p>

          {totalPages > 1 && (
            <div className={styles.navButtons}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={goPrev}
                aria-label="Previous testimonials"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={goNext}
                aria-label="Next testimonials"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div key={page} ref={sectionRef} className={styles.cardsGrid}>
          <div className={styles.column}>
            {[visible[0], visible[1]].map((t, i) =>
              t ? (
                <motion.div key={t.id} custom={i} variants={cardVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
                  <TestimonialCard testimonial={t} />
                </motion.div>
              ) : null,
            )}
          </div>
          <div className={`${styles.column} ${styles.columnOffset}`}>
            {[visible[2], visible[3]].map((t, i) =>
              t ? (
                <motion.div key={t.id} custom={i + 2} variants={cardVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
                  <TestimonialCard testimonial={t} />
                </motion.div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
