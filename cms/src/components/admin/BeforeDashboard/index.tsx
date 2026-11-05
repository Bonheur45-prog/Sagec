import React from 'react'
import logo from '../assets/images/logo.png'
import styles from './BeforeDashboard.module.css'

/**
 * Renders above the default Dashboard content.
 * Registered in payload.config.ts as admin.components.beforeDashboard: ['/components/admin/BeforeDashboard#BeforeDashboard']
 */
export function BeforeDashboard() {
  return (
    <div className={styles.banner}>
      <img src={logo.src} alt="SAGEC Ltd" className={styles.logo} />
      <div className={styles.textBlock}>
        <p className={styles.eyebrow}>Content Management</p>
        <h2 className={styles.heading}>Welcome to the SAGEC Ltd CMS</h2>
        <p className={styles.subline}>
          Manage projects, services, testimonials, and every page on the public site from here.
        </p>
      </div>
    </div>
  )
}