import { Link } from 'react-router-dom'
import { useServicesPage } from '@hooks/useServicesPage'
import styles from './ServicesCTA.module.css'

export default function ServicesCTA() {
  const { data: cta, isLoading, isError } = useServicesPage((page) => page.servicesCTA)

  // Same call as ProjectsCTA: this is a single, specific CTA block, not
  // generic chrome — nothing sensible to show before real copy arrives.
  if (isLoading || isError || !cta) return null

  return (
    <section className={styles.section} aria-labelledby="services-cta-heading">
      <div className={styles.background} aria-hidden="true">
        <div className={styles.glow} />
      </div>

      <div className={styles.container}>
        <div className={styles.textSide}>
          <p className={styles.eyebrow}>Let&rsquo;s Build Something Exceptional</p>
          <h2 id="services-cta-heading" className={styles.heading}>
            {cta.heading}
          </h2>
          <div className={styles.accentLine} aria-hidden="true" />
          <p className={styles.subline}>{cta.subline}</p>
        </div>

        <div className={styles.buttonSide}>
          <Link to={cta.primaryBtnLink} className={styles.btnPrimary}>
            {cta.primaryBtnLabel}
          </Link>
          <Link to={cta.secondaryBtnLink} className={styles.btnSecondary}>
            {cta.secondaryBtnLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}