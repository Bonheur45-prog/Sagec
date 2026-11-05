import React from 'react'
import logo from '../assets/images/logo.png'
import icon from '../assets/images/icon.png'
import styles from './Logo.module.css'

/**
 * Full SAGEC logo — shown on the Login screen.
 * Registered in payload.config.ts as admin.components.graphics.Logo
 */
export function Logo() {
  return (
    <div className={styles.logo}>
      <img src={logo.src} alt="SAGEC Ltd" className={styles.logoImage} />
    </div>
  )
}

/**
 * Square "S" mark — shown in the admin header / collapsed sidebar.
 * Registered in payload.config.ts as admin.components.graphics.Icon
 */
export function Icon() {
  return (
    <span className={styles.iconWrap}>
      <img src={icon.src} alt="SAGEC Ltd" className={styles.iconImage} />
    </span>
  )
}
