import React from 'react'
import styles from './BeforeLogin.module.css'

/**
 * Renders above the default Login form.
 * Registered in payload.config.ts as admin.components.beforeLogin: ['/components/admin/BeforeLogin#BeforeLogin']
 *
 * NOTE: does NOT render the logo — Payload already auto-places the
 * registered admin.components.graphics.Logo component on this screen.
 * Rendering it again here caused a duplicate-logo bug. This component
 * only adds the supplementary tagline text.
 */
export function BeforeLogin() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.tagline}>SAGEC Ltd — Content Management System</p>
    </div>
  )
}