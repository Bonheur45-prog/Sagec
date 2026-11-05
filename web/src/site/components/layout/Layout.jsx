'use client';

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import { useSiteChrome } from './site-chrome'
import styles from './Layout.module.css'

// Only the home page starts under a full-screen hero, so only there can the header be see-through
// (and only while "See-through over hero photos" is on in CMS → Header).
export default function Layout({ children }) {
  const { header } = useSiteChrome()
  const hasHero = usePathname() === '/' && (header?.transparentOnHero ?? true)
  return (
    <div className={styles.layout}>
      <Navbar transparent={hasHero} />
      <main className={`${styles.main} ${hasHero ? styles.mainHero : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
