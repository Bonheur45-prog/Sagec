'use client';

import { useParams, Link, Navigate } from '@site/router'
import { motion } from 'framer-motion'
import { useProject, useProjects, useProjectsPage, getProjectSpecs, projectQuery } from '@hooks/useProjects'
import { usePrefetch } from '@hooks/usePrefetch'
import { mediaURL } from '@lib/api'
import PageLoader from '@components/ui/PageLoader'
import Seo from '@components/ui/Seo'
import ProjectGallery from '@components/projects/ProjectGallery'
import styles from './ProjectDetailPage.module.css'

// ── MAIN PAGE ──────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { data: project, isLoading, isError, error } = useProject(slug)
  const { data: allProjects } = useProjects()
  const { data: labels } = useProjectsPage((page) => page.projectDetailLabels)
  const prefetch = usePrefetch()

  if (isLoading) {
    return <PageLoader />
  }

  if (isError) {
    // A real fetch failure — distinct from "not found". Don't redirect
    // silently here, since that would misleadingly look like the
    // project doesn't exist when actually the request itself failed.
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p>Couldn&apos;t load this project right now ({error.message}).</p>
      </div>
    )
  }

  if (!project) {
    // Successfully loaded, confirmed no match — genuinely not found.
    return <Navigate to="/projects" replace />
  }
  const specs = getProjectSpecs(project)
  // Gallery photos: the 1600px copy for the big frame (lighter than the original), with the photo's own description.
  const galleryImages = (project.gallery ?? [])
    .filter((g) => g.image?.url)
    .map((g) => ({ src: mediaURL(g.image.sizes?.tablet?.url ?? g.image.url), alt: g.image.alt }))

  const related = (allProjects ?? [])
    .filter((p) => p.slug !== slug && p.category === project.category)
    .slice(0, 3)

  const relatedFilled = related.length >= 2
    ? related
    : [
        ...related,
        ...(allProjects ?? [])
          .filter((p) => p.slug !== slug && !related.includes(p))
          .slice(0, 3 - related.length),
      ]

  return (
    <div className={styles.page}>
      <Seo
        title={project.title}
        description={project.description}
        path={`/projects/${slug}`}
        image={mediaURL(project.featuredImage?.url || project.coverImage?.url)}
      />

      {/* ── HERO ──────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <img src={mediaURL(project.featuredImage?.url)} alt="" className={styles.heroBgImage} />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.sep} aria-hidden="true">/</span>
            <Link to="/projects" className={styles.breadcrumbLink}>Projects</Link>
            <span className={styles.sep} aria-hidden="true">/</span>
            <span className={styles.breadcrumbCurrent}>{project.title}</span>
          </nav>
          <motion.span className={styles.categoryBadge} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            {project.category}
          </motion.span>
          <motion.h1 className={styles.heroTitle} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
            {project.title}
          </motion.h1>
          <motion.div className={styles.heroMeta} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <span>{project.location}</span>
            <span className={styles.metaDot} aria-hidden="true" />
            <span>{project.year}</span>
            <span className={styles.metaDot} aria-hidden="true" />
            <span className={project.status === 'In Progress' ? styles.statusActive : styles.statusDone}>{project.status}</span>
          </motion.div>
        </div>
      </section>

      {/* ── GALLERY ───────────────────────── */}
      {galleryImages.length > 0 && <section className={styles.gallerySection}>
        <div className={styles.galleryContainer}>
          <ProjectGallery
            slides={galleryImages}
            heading={labels?.galleryHeading || 'Gallery'}
            title={project.title}
            location={project.location}
          />
        </div>
      </section>}

      {/* ── OVERVIEW + SPECS ──────────────── */}
      <section className={styles.detailSection}>
        <div className={styles.detailInner}>
          <motion.div className={styles.overviewBlock} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className={styles.blockHeading}>{labels?.overviewHeading || 'Project Overview'}</h2>
            <div className={styles.accentLine} aria-hidden="true" />
            {/* One paragraph per block of text written in CMS → Projects */}
            {String(project.description ?? '').split(/\n\s*\n/).filter(Boolean).map((para, i) => (
              <p key={i} className={styles.description}>{para}</p>
            ))}
            <div className={styles.servicesBlock}>
              <h3 className={styles.servicesHeading}>{labels?.servicesHeading || 'Services Delivered'}</h3>
              <div className={styles.tags}>
                {(project.services ?? []).map((s) => (
                  <span key={s.id ?? s.slug ?? s.title} className={styles.tag}>{s.title}</span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div className={styles.specsBlock} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}>
            <h2 className={styles.blockHeading}>{labels?.specsHeading || 'Project Specs'}</h2>
            <div className={styles.accentLine} aria-hidden="true" />
            <dl className={styles.specsList}>
              {specs.map(([key, val]) => (
                <div key={key} className={styles.specRow}>
                  <dt className={styles.specKey}>{key}</dt>
                  <dd className={styles.specVal}>{val}</dd>
                </div>
              ))}
            </dl>
            <Link to="/contact" className={styles.ctaBtn}>{labels?.ctaLabel || 'Discuss a Similar Project'}</Link>
          </motion.div>
        </div>
      </section>

      {/* ── RELATED PROJECTS ──────────────── */}
      {relatedFilled.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedContainer}>
            <h2 className={styles.relatedHeading}>{labels?.relatedHeading || 'Related Projects'}</h2>
            <div className={styles.relatedGrid}>
              {relatedFilled.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.slug}`}
                  className={styles.relatedCard}
                  onMouseEnter={() => prefetch(projectQuery(p.slug))}
                  onFocus={() => prefetch(projectQuery(p.slug))}
                >
                  <div className={styles.relatedImageWrapper}>
                    <img src={mediaURL(p.coverImage?.url)} alt={p.title} className={styles.relatedImage} loading="lazy" />
                    <div className={styles.relatedOverlay} aria-hidden="true" />
                    <div className={styles.relatedInfo}>
                      <span className={styles.relatedCategory}>{p.category}</span>
                      <h3 className={styles.relatedTitle}>{p.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className={styles.relatedCTA}>
              <Link to="/projects" className={styles.allProjectsBtn}>View All Projects</Link>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}