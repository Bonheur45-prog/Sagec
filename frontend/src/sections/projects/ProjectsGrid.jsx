import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjects, useProjectsPage, PROJECT_CATEGORIES, projectQuery } from '@hooks/useProjects'
import { usePrefetch } from '@hooks/usePrefetch'
import { mediaURL } from '@lib/api'
import styles from './ProjectsGrid.module.css'

// ── ANIMATION VARIANTS ─────────────────────────────────────

const gridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const cardVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, scale: 0.95,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

// ── PROJECT CARD ───────────────────────────────────────────

function ProjectCard({ project }) {
  const prefetch = usePrefetch()
  const prefetchThis = () => prefetch(projectQuery(project.slug))

  return (
    <motion.article
      className={styles.card}
      variants={cardVariants}
      layout
      whileHover={{ y: -4, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      <Link
        to={`/projects/${project.slug}`}
        className={styles.cardLink}
        aria-label={`View ${project.title}`}
        onMouseEnter={prefetchThis}
        onFocus={prefetchThis}
      >
        {/* Image */}
        <div className={styles.imageWrapper}>
          <img
            src={mediaURL(project.coverImage?.url)}
            alt={project.title}
            className={styles.image}
            loading="lazy"
          />

          {/* Hover overlay */}
          <div className={styles.hoverOverlay} aria-hidden="true">
            <div className={styles.viewBtn}>
              View Project
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Bottom info overlay (always visible) */}
          <div className={styles.infoOverlay}>
            <div className={styles.infoTop}>
              <span className={styles.categoryBadge}>{project.category}</span>
              {project.status === 'In Progress' && (
                <span className={styles.progressBadge}>In Progress</span>
              )}
            </div>
            <div className={styles.infoBottom}>
              <h3 className={styles.cardTitle}>{project.title}</h3>
              <span className={styles.cardYear}>{project.year}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

// ── MAIN GRID COMPONENT ────────────────────────────────────

export default function ProjectsGrid() {
  const [activeCategory, setActiveCategory] = useState('All')
  const { data: projects, isLoading, isError } = useProjects()
  const { data: emptyMessage } = useProjectsPage((page) => page.projectsEmptyMessage)

  const filtered = !projects
    ? []
    : activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  return (
    <section className={styles.section} aria-labelledby="grid-heading">
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.eyebrow}>All Work</span>
            <h2 id="grid-heading" className={styles.heading}>
              Explore Our Projects
            </h2>
          </div>

          {/* Filter tabs */}
          <div
            className={styles.filters}
            role="tablist"
            aria-label="Filter projects by category"
          >
            {PROJECT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && <p className={styles.empty}>Loading projects…</p>}

        {/* Error state (a toast also fires globally on failure) */}
        {isError && <p className={styles.empty}>Could not load projects right now.</p>}

        {/* Grid */}
        {!isLoading && !isError && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className={styles.grid}
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              {filtered.length > 0 ? (
                filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <motion.p
                  className={styles.empty}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {emptyMessage || 'No projects in this category yet.'}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </section>
  )
}