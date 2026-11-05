'use client';

import { useInView } from '@hooks/useInView'
import { usePartners } from '@hooks/usePartners'
import { useHomePage } from '@hooks/useHomePage'
import { mediaURL } from '@lib/api'
import styles from './PartnersStrip.module.css'

/**
 * Partner / client logo strip, fed by the Partners collection in the CMS
 * (heading text comes from the Home Page global's "Partners Strip" group).
 * Renders nothing until at least one partner exists, so an empty
 * collection never leaves a blank band on the home page.
 */
export default function PartnersStrip() {
  const [ref, inView] = useInView(0.2)
  const { data: partners } = usePartners()
  const { data: teaser } = useHomePage((home) => home.partnersTeaser)

  if (!partners?.length) return null

  return (
    <section className={styles.section} ref={ref} aria-labelledby="partners-heading">
      <div className="container">
        <div className={`${styles.header} fade-in-up ${inView ? 'is-visible' : ''}`}>
          <span className={styles.eyebrow}>{teaser?.eyebrow || 'Trusted By'}</span>
          <h2 id="partners-heading" className={styles.heading}>
            {teaser?.heading || 'Our Partners'}
          </h2>
        </div>

        <ul className={`${styles.list} fade-in-up ${inView ? 'is-visible' : ''}`}>
          {partners.map((partner) => {
            const src = mediaURL(partner.logo?.url)
            if (!src) return null

            const logo = (
              <img
                src={src}
                alt={partner.name}
                className={styles.logo}
                loading="lazy"
                decoding="async"
              />
            )

            return (
              <li key={partner.id} className={styles.item}>
                {partner.website ? (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                    aria-label={`${partner.name} (opens in a new tab)`}
                  >
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
