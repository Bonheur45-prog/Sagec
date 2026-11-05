import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useContactPage } from '@hooks/useContactPage'
import { mediaURL } from '@lib/api'
import styles from './ContactHero.module.css'

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export default function ContactHero() {
  const { data: hero, isLoading, isError } = useContactPage((page) => page.hero)

  if (isLoading || isError || !hero) return null

  const bgUrl = mediaURL(hero.backgroundImage?.url)

  return (
    <section className={styles.hero} aria-label="Contact SAGEC">

      {/* Background */}
      <div className={styles.background} aria-hidden="true">
        {bgUrl && <img src={bgUrl} alt="" className={styles.bgImage} />}
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
            <span className={styles.breadcrumbCurrent}>Contact</span>
          </motion.nav>

          <motion.p className={styles.eyebrow} variants={itemVariants}>
            {hero.eyebrow}
          </motion.p>

          <motion.h1 className={styles.headline} variants={itemVariants}>
            {hero.headline}
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
            {hero.subline}
          </motion.p>
        </motion.div>
      </div>

    </section>
  )
}
