import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from '@hooks/useInView'
import { useTestimonials } from '@hooks/useTestimonials'
import TestimonialCard from '@components/TestimonialCard/TestimonialCard'
import styles from './TestimonialsGrid.module.css'

const PAGE_SIZE = 4

// ANIMATION FIX: cards used to share one flat `fade-in` class on the
// whole grid wrapper — all 4 cards appeared as a single simultaneous
// block, which barely reads as an animation at all (and is easy to miss
// entirely). This staggers each card individually, same pattern as the
// FeaturedProjects cards elsewhere on the site. Because `initial`/
// `animate` (not `whileInView`) drive this, it replays every time the
// page changes too, not just on first scroll into view.
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function TestimonialsGrid() {
  const [sectionRef, inView] = useInView(0.15)
  const [page, setPage] = useState(0)
  const { data: testimonials, isLoading, isError } = useTestimonials()

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
    <section className={styles.section} aria-label="Client testimonials">

      {/* CSS-only drifting dot-particle texture — no image asset */}
      <div className={styles.particles} aria-hidden="true" />

      <div className={styles.container}>
        <div key={page} ref={sectionRef} className={styles.cardsGrid}>
          <div className={styles.column}>
            {[visible[0], visible[1]].map((t, i) =>
              t ? (
                <motion.div
                  key={t.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                >
                  <TestimonialCard testimonial={t} />
                </motion.div>
              ) : null,
            )}
          </div>
          <div className={`${styles.column} ${styles.columnOffset}`}>
            {[visible[2], visible[3]].map((t, i) =>
              t ? (
                <motion.div
                  key={t.id}
                  custom={i + 2}
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                >
                  <TestimonialCard testimonial={t} />
                </motion.div>
              ) : null,
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div
            className={`${styles.navButtons} fade-in-up ${inView ? 'is-visible' : ''}`}
            style={{ animationDelay: '0.5s' }}
          >
            <button
              type="button"
              className={styles.navBtn}
              onClick={goPrev}
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={18} />
            </button>

            <span className={styles.pageCounter} aria-live="polite">
              {page + 1} / {totalPages}
            </span>

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
    </section>
  )
}
