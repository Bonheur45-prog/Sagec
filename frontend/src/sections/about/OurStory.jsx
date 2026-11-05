import { motion } from 'framer-motion'
import { useAboutPage } from '@hooks/useAboutPage'
import { mediaURL } from '@lib/api'
import styles from './OurStory.module.css'

// ── ANIMATION VARIANTS ─────────────────────────────────────

const slideLeft = {
  hidden:  { opacity: 0, x: -64 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
}

const slideRight = {
  hidden:  { opacity: 0, x: 64 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
}

const paragraphContainer = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.5,
    },
  },
}

const paragraphItem = {
  hidden:  { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

// Kept as a fallback set of labels — the CMS story group doesn't model
// this trio separately (it's presentational, not editorial content),
// same boundary as the "not building new schema" calls elsewhere.
const STAT_ROW = [
  { value: '10+', label: 'Years Experience' },
  { value: '30+', label: 'Projects' },
  { value: '50+', label: 'Happy Clients' },
]

// ── MAIN COMPONENT ─────────────────────────────────────────

export default function OurStory() {
  const { data: story, isLoading, isError } = useAboutPage((about) => about.story)

  if (isLoading || isError || !story) return null

  return (
    <section className={styles.section} aria-labelledby="story-heading">
      <div className={styles.container}>

        {/* ── TEXT COLUMN (left) ───────────────── */}
        <motion.div
          className={styles.textColumn}
          variants={slideLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <p className={styles.eyebrow}>{story.eyebrow}</p>

          <h2 id="story-heading" className={styles.heading}>
            {story.heading}
          </h2>

          <div className={styles.accentLine} aria-hidden="true" />

          <motion.div
            className={styles.paragraphs}
            variants={paragraphContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {(story.paragraphs ?? []).map((para, i) => (
              <motion.p
                key={i}
                className={styles.paragraph}
                variants={paragraphItem}
              >
                {para.text}
              </motion.p>
            ))}
          </motion.div>

          <motion.blockquote
            className={styles.quote}
            variants={paragraphItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <p>{story.quote}</p>
          </motion.blockquote>

          <motion.div
            className={styles.stats}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {STAT_ROW.map((stat, i) => (
              <div key={i} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
                {i < STAT_ROW.length - 1 && <div className={styles.statDot} aria-hidden="true" />}
              </div>
            ))}
          </motion.div>

        </motion.div>

        {/* ── IMAGE COLUMN (right) ─────────────── */}
        <motion.div
          className={styles.imageColumn}
          variants={slideRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className={styles.imageFrame}>
            <img
              src={mediaURL(story.image?.url)}
              alt={story.imageAlt}
              className={styles.image}
              loading="lazy"
            />
          </div>
        </motion.div>

      </div>
    </section>
  )
}
