'use client';

import { useEffect } from 'react'
import { NavLink, Link } from '@site/router'
import { motion } from 'framer-motion'
import { useCompanyInfo } from '@hooks/useCompanyInfo'
import styles from './MobileDrawer.module.css'

// Animation variants
const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
}

const drawerVariants = {
  hidden:  { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.45 },
  },
  exit: {
    x: '100%',
    transition: { type: 'tween', ease: [0.4, 0, 1, 1], duration: 0.3 },
  },
}

const linkListVariants = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
}

const linkItemVariants = {
  hidden:  { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.4 },
  },
}

export default function MobileDrawer({ onClose, links: navLinks, cta }) {
  const { data: company } = useCompanyInfo()
  const phone = company?.phone ?? '+250 788 470 243'
  const email = company?.email ?? 'sagecltd@gmail.com'
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, '')}`

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* ── BACKDROP ─────────────────────────── */}
      <motion.div
        className={styles.backdrop}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── DRAWER ───────────────────────────── */}
      <motion.aside
        className={styles.drawer}
        variants={drawerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className={styles.header}>
          <Link to="/" className={styles.drawerLogo} onClick={onClose}>
            <img src="/logo-color.png" alt="SAGEC Ltd" className={styles.logoImg} />
          </Link>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Nav Links */}
        <motion.nav
          variants={linkListVariants}
          initial="hidden"
          animate="visible"
        >
          <ul className={styles.linkList} role="list">
            {navLinks.map((link) => (
              <motion.li key={link.path} variants={linkItemVariants}>
                <NavLink
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.linkActive : ''}`
                  }
                  onClick={onClose}
                >
                  {link.label}
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </motion.nav>

        {/* Footer CTA */}
        <div className={styles.footer}>
          {cta && (
            <Link
              to={cta.url}
              className={styles.cta}
              onClick={onClose}
            >
              {cta.label}
            </Link>
          )}
          <div className={styles.contactInfo}>
            <a href={phoneHref} className={styles.contactLink}>
              {phone}
            </a>
            <a href={`mailto:${email}`} className={styles.contactLink}>
              {email}
            </a>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
