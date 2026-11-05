'use client';

import { useState } from 'react'
import { Link, NavLink } from '@site/router'
import { AnimatePresence } from 'framer-motion'
import { useScrolled } from '@hooks/useScrolled'
import { navLinks as fallbackLinks } from '@data/navigation'
import { useSiteChrome } from './site-chrome'
import MobileDrawer from './MobileDrawer'
import styles from './Navbar.module.css'

export default function Navbar({ transparent }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const scrolled = useScrolled(60)
  const { header } = useSiteChrome()
  // Menu and button from CMS → Header (falls back to the built-in menu before the first publish)
  const navLinks = header?.navItems?.length ? header.navItems.map((n) => ({ label: n.label, path: n.url, newTab: n.newTab })) : fallbackLinks
  const cta = header ? (header.cta.enabled ? header.cta : null) : { label: 'Let’s Build', url: '/contact', newTab: false }

  // Solid when: not on a hero page, OR user has scrolled past threshold
  const isSolid = !transparent || scrolled

  return (
    <>
      <nav className={`${styles.navbar} ${isSolid ? styles.solid : styles.clear}`}>
        <div className={styles.inner}>

          {/* ── LOGO ─────────────────────────────── */}
          <Link to="/" className={styles.logo} aria-label="SAGEC Ltd — Home">
            <img
              src="/logo-color.png"
              alt="SAGEC Ltd"
              className={styles.logoImg}
              /*style={{ filter: isSolid ? 'none' : 'brightness(0) invert(1)' }}*/
            />
          </Link>

          {/* ── DESKTOP NAV LINKS ────────────────── */}
          <ul className={styles.navLinks} role="list">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    [
                      styles.navLink,
                      isSolid ? styles.navLinkSolid : styles.navLinkClear,
                      isActive ? styles.navLinkActive : '',
                    ].join(' ')
                  }
                >
                  {link.label}
                  <span className={styles.navLinkUnderline} />
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── CTA BUTTON ───────────────────────── */}
          {cta && (
            <Link
              to={cta.url}
              className={`${styles.cta} ${isSolid ? styles.ctaSolid : styles.ctaClear}`}
              {...(cta.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {cta.label}
            </Link>
          )}

          {/* ── HAMBURGER (mobile only) ───────────── */}
          <button
            className={styles.hamburger}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
          >
            <span className={`${styles.bar} ${styles.barDark}`} />
            <span className={`${styles.bar} ${styles.barDark}`} />
            <span className={`${styles.bar} ${styles.barDark}`} />
          </button>

        </div>
      </nav>

      {/* ── MOBILE DRAWER ────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <MobileDrawer onClose={() => setDrawerOpen(false)} links={navLinks} cta={cta} />
        )}
      </AnimatePresence>
    </>
  )
}
