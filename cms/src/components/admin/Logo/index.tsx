import React from 'react'
import logo from '../assets/images/logo.png'
import styles from './Logo.module.css'

/**
 * Full logo — shown on the Login screen and expanded sidebar.
 * Registered in payload.config.ts as admin.components.graphics.Logo
 *
 * NOTE: `logo.png` at ../assets/images/logo.png is still Royal
 * Ventures' logo file (placeholder, per your instruction) — swap
 * in SAGEC's actual logo file at that same path when it's ready.
 */
export function Logo() {
  return (
    <div className={styles.logo}>
      <img src={logo.src} alt="SAGEC Ltd" className={styles.logoImage} />
    </div>
  )
}

/**
 * Small icon — shown when the sidebar is collapsed.
 * Registered in payload.config.ts as admin.components.graphics.Icon
 */
export function Icon() {
  return (
    <span className={styles.iconWrap}>
      <img src={logo.src} alt="SAGEC Ltd" className={styles.iconImage} />
    </span>
  )
}