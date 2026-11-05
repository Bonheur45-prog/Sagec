import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAboutPage } from '@hooks/useAboutPage'
import styles from './AboutCTA.module.css'

// ── ANIMATION VARIANTS ─────────────────────────────────────
const leftVariants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
}

const rightVariants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.15 } },
}

export default function AboutCTA() {
  const { data: cta, isLoading, isError } = useAboutPage((about) => about.aboutCTA)

  if (isLoading || isError || !cta) return null

  return (
    <section className={styles.section} aria-labelledby="about-cta-heading">

      <div className={styles.accentTopRight}  aria-hidden="true" />
      <div className={styles.accentBottomLeft} aria-hidden="true" />

      <div className={styles.container}>

        <motion.div
          className={styles.textSide}
          variants={leftVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <span className={styles.eyebrow}>{cta.eyebrow}</span>
          <h2 id="about-cta-heading" className={styles.heading}>
            {cta.heading}
          </h2>
          <div className={styles.accentLine} aria-hidden="true" />
          <p className={styles.subline}>{cta.subline}</p>
        </motion.div>

        <motion.div
          className={styles.buttonSide}
          variants={rightVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <Link to={cta.primaryBtnLink} className={styles.btnPrimary}>
            {cta.primaryBtnLabel}
          </Link>
          <Link to={cta.secondaryBtnLink} className={styles.btnSecondary}>
            {cta.secondaryBtnLabel}
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
