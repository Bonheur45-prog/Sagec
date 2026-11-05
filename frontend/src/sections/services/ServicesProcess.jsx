import { motion } from 'framer-motion'
import { useServicesPage } from '@hooks/useServicesPage'
import styles from './ServicesProcess.module.css'

// ── ANIMATION VARIANTS ─────────────────────────────────────

const headingVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const stepsVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const stepVariants = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

// ── LOADING SKELETON ────────────────────────────────────────
// processSteps is a real, ordered data array (not generic chrome
// text), so — same principle as ServicesList/HomeStats — it gets a
// skeleton instead of a guessed fallback list.

function ProcessSkeleton() {
  return (
    <div className={styles.steps}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.step}>
          <div className={`${styles.numberCircle} ${styles.skeletonCircle}`} aria-hidden="true" />
          <div className={styles.stepContent}>
            <div className={styles.skeletonLine} style={{ width: '70%', height: '1.1rem' }} />
            <div className={styles.skeletonLine} style={{ width: '95%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────

export default function ServicesProcess() {
  // The section's own heading/subheading aren't modeled as CMS fields
  // (ServicesPage.processSteps is just the array of steps) — kept as
  // static copy here, same as the original. Only the steps themselves
  // are data-driven.
  const { data: processSteps, isLoading, isError } = useServicesPage((page) => page.processSteps)

  return (
    <section className={styles.section} aria-labelledby="process-heading">
      <div className={styles.container}>

        {/* Header */}
        <motion.div
          className={styles.header}
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <span className={styles.eyebrow}>How We Work</span>
          <h2 id="process-heading" className={styles.heading}>
            Our Process
          </h2>
          <p className={styles.subheading}>
            From first conversation to final handover — a clear, collaborative
            process built around your goals.
          </p>
        </motion.div>

        {/* Steps */}
        {isLoading && <ProcessSkeleton />}

        {isError && (
          <p className={styles.errorText}>Couldn&apos;t load our process steps right now.</p>
        )}

        {processSteps && (
          <motion.div
            className={styles.steps}
            variants={stepsVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={styles.step}
                variants={stepVariants}
              >
                {/* Connector line (between steps, not after last) */}
                {index < processSteps.length - 1 && (
                  <div className={styles.connector} aria-hidden="true" />
                )}

                {/* Number circle */}
                <div className={styles.numberCircle} aria-hidden="true">
                  <span className={styles.number}>{step.number}</span>
                </div>

                {/* Step content */}
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </section>
  )
}