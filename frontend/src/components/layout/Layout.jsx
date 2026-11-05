import { Outlet } from 'react-router-dom'
import { usePageTracking } from '@hooks/usePageTracking'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from '../ScrollToTop'
import styles from './Layout.module.css'

export default function Layout({ hasHero = false }) {
  usePageTracking()
  return (
    <div className={styles.layout}>
      <ScrollToTop />
      <Navbar transparent={hasHero} />
      <main className={`${styles.main} ${hasHero ? styles.mainHero : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
