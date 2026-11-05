'use client';

import { Link } from '@site/router'
import styles from './PageHeader.module.css'

/**
 * Reusable banner for every inner page: dark photo background,
 * page title, and a "Home / <label>" breadcrumb.
 *
 * Usage (from a page's Hero section, e.g. BlogHero.jsx):
 *   <PageHeader title="Our Blog" breadcrumbLabel="Blog" backgroundImage="/images/..." />
 */
/**
 * Reusable banner for every inner page: dark photo background,
 * page title, and a "Home / <label>" breadcrumb.
 *
 * Usage (from a page's Hero section, e.g. BlogHero.jsx):
 *   <PageHeader title="Our Blog" breadcrumbLabel="Blog" backgroundImage="/images/..." />
 *
 * For a page nested one level deeper (e.g. a single blog post under
 * /blog), pass `breadcrumbParent` to get a three-level trail instead:
 *   <PageHeader title={post.title} breadcrumbParent={{ label: 'Blog', to: '/blog' }} breadcrumbLabel={post.title} backgroundImage={...} />
 *   → renders: Home / Blog / <post title>
 */
export default function PageHeader({ title, breadcrumbLabel, breadcrumbParent, backgroundImage }) {
  return (
    <header className={styles.header}>
      <div
        className={styles.background}
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
      />
      <div className={styles.overlay} />

      <div className={`container ${styles.content}`}>
        <h1 className={styles.title}>{title}</h1>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {breadcrumbParent && (
            <>
              <span aria-hidden="true">/</span>
              <Link to={breadcrumbParent.to}>{breadcrumbParent.label}</Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span aria-current="page">{breadcrumbLabel}</span>
        </nav>
      </div>
    </header>
  )
}
