import { useInView } from '@hooks/useInView'
import { useTestimonialsPage } from '@hooks/useTestimonials'
import { mediaURL } from '@lib/api'
import styles from './TestimonialsHero.module.css'

export default function TestimonialsHero() {
  const [ref, inView] = useInView(0.3)
  const { data: hero } = useTestimonialsPage()

  const eyebrow = hero?.eyebrow ?? 'Client Stories'
  const headlineLines = [
    hero?.headlineLine1 ?? 'What Our Clients',
    hero?.headlineLine2 ?? 'Say About Us',
  ]
  const subline =
    hero?.subline ??
    'Real feedback from partners, developers, and institutions who trust SAGEC to bring their vision to life.'

  // CMS photo if one was uploaded; otherwise the CSS falls back to the default
  // banner image, and to a navy gradient if that file isn't there either.
  const bgUrl = mediaURL(hero?.backgroundImage?.url)

  return (
    <section className={styles.hero} aria-label={eyebrow}>
      <div
        className={styles.background}
        style={bgUrl ? { '--hero-bg': `url("${bgUrl}")` } : undefined}
        aria-hidden="true"
      />
      <div className={styles.overlay} aria-hidden="true" />

      <div ref={ref} className={styles.wrapper}>
        <p className={`${styles.eyebrow} fade-in-up ${inView ? 'is-visible' : ''}`}>
          {eyebrow}
        </p>

        <h1
          className={`${styles.headline} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ animationDelay: '0.1s' }}
        >
          {headlineLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headlineLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p
          className={`${styles.subline} fade-in-up ${inView ? 'is-visible' : ''}`}
          style={{ animationDelay: '0.2s' }}
        >
          {subline}
        </p>
      </div>
    </section>
  )
}
