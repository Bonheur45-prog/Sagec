'use client';

import { Quote } from 'lucide-react'
import { getInitials } from '@utils/text'
import { mediaURL } from '@lib/api'
import styles from './TestimonialCard.module.css'

export default function TestimonialCard({ testimonial }) {
  // CMS returns `avatar` as a media doc ({ url, alt, ... }) once one is
  // uploaded, not a plain URL string like the old static data did.
  const avatarUrl = testimonial.avatar?.url ? mediaURL(testimonial.avatar.url) : null

  return (
    <div className={styles.card}>
      <span className={styles.borderTop} aria-hidden="true" />
      <span className={styles.borderRight} aria-hidden="true" />
      <span className={styles.borderBottom} aria-hidden="true" />
      <span className={styles.borderLeft} aria-hidden="true" />

      <div className={styles.cardHeader}>
        <div className={styles.avatar}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={testimonial.name} loading="lazy" />
          ) : (
            <span className={styles.initials}>{getInitials(testimonial.name)}</span>
          )}
        </div>
        <div className={styles.identity}>
          <p className={styles.name}>{testimonial.name}</p>
          <p className={styles.role}>{testimonial.role}</p>
        </div>
        <Quote className={styles.quoteIcon} size={28} aria-hidden="true" />
      </div>

      <p className={styles.quoteText}>{testimonial.quote}</p>
    </div>
  )
}
