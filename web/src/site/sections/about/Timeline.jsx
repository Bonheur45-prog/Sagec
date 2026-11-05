'use client';

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAboutPage } from '@hooks/useAboutPage'
import { mediaURL } from '@lib/api'
import styles from './Timeline.module.css'

// ── ANIMATION VARIANTS ─────────────────────────────────────
const headingVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const milestoneVariants = {
  hidden:  { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
}

function MilestoneItem({ milestone, index }) {
  const isLeft = index % 2 === 0

  return (
    <motion.div
      className={`${styles.milestone} ${isLeft ? styles.milestoneLeft : styles.milestoneRight}`}
      variants={milestoneVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className={styles.contentArea}>
        <span className={styles.year}>{milestone.year}</span>
        <span className={styles.badge}>{milestone.badge}</span>
        <h3 className={styles.title}>{milestone.title}</h3>
        <p className={styles.description}>{milestone.description}</p>
      </div>

      <div className={styles.circleArea}>
        <div className={styles.circle} aria-hidden="true">
          <img src="/logo-color.png" alt="" className={styles.circleLogo} />
        </div>
      </div>

      <div className={styles.emptyArea} aria-hidden="true" />
    </motion.div>
  )
}

export default function Timeline() {
  const sectionRef = useRef(null)
  const { data, isLoading, isError } = useAboutPage((about) => ({
    eyebrow: about.timelineEyebrow,
    heading: about.timelineHeading,
    backgroundImage: about.timelineBackgroundImage,
    milestones: about.milestones,
  }))

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])

  if (isLoading || isError || !data) return null

  const backgroundUrl = mediaURL(data.backgroundImage?.url)

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="timeline-heading">
      <motion.div className={styles.parallaxBg} style={{ y: backgroundY }} aria-hidden="true">
        <div
          className={styles.bgImage}
          style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined}
        />
        <div className={styles.bgOverlay} />
      </motion.div>

      <div className={styles.content}>
        <motion.div
          className={styles.header}
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <span className={styles.eyebrow}>{data.eyebrow}</span>
          <h2 id="timeline-heading" className={styles.heading}>
            {data.heading}
          </h2>
        </motion.div>

        <div className={styles.timelineWrapper}>
          <div className={styles.centerLine} aria-hidden="true" />

          {(data.milestones ?? []).map((milestone, i) => (
            <MilestoneItem key={i} milestone={milestone} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
