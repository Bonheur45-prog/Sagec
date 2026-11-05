'use client';

import { useState, useMemo } from 'react'
import { Link, useSearchParams } from '@site/router'
import { User, ArrowRight } from 'lucide-react'
import { useInView } from '@hooks/useInView'
import { useBlogPosts, blogPostQuery } from '@hooks/useBlog'
import { usePrefetch } from '@hooks/usePrefetch'
import { mediaURL } from '@lib/api'
import BlogSidebar from '@components/blog/BlogSidebar'
import { useBlogCopy } from '@hooks/useBlogPage'
import styles from './BlogGrid.module.css'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatDateBadge(dateStr) {
  const d = new Date(dateStr)
  return { day: d.getDate(), month: MONTHS[d.getMonth()] }
}

function BlogCard({ post, index, inView }) {
  const prefetch = usePrefetch()
  const { day, month } = formatDateBadge(post.publishedAt)

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`${styles.card} fade-in-up ${inView ? 'is-visible' : ''}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      onMouseEnter={() => prefetch(blogPostQuery(post.slug))}
      onFocus={() => prefetch(blogPostQuery(post.slug))}
    >
      <div className={styles.imageArea}>
        <img className={styles.image} src={mediaURL(post.coverImage?.url)} alt="" aria-hidden="true" />
        <div className={styles.dateBadge}>
          <span className={styles.dateDay}>{day}</span>
          <span className={styles.dateMonth}>{month}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <User size={13} /> {post.author?.name ?? 'SAGEC Team'}
          </span>
        </div>
        <h3 className={styles.cardTitle}>{post.title}</h3>
        <span className={styles.readMore}>
          Read More <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}

function BlogSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`${styles.card} ${styles.cardSkeleton}`} />
      ))}
    </>
  )
}

export default function BlogGrid() {
  const copy = useBlogCopy('grid')
  const [sectionRef, inView] = useInView(0.1)
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const { data: posts, isLoading, isError, error } = useBlogPosts()

  const filteredPosts = useMemo(() => {
    if (!posts) return []
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    )
  }, [posts, query])

  return (
    <section className={styles.section}>
      <div className={`container ${styles.header} fade-in-up ${inView ? 'is-visible' : ''}`}>
        <span className={styles.eyebrow}>{copy.eyebrow}</span>
        <h2 className={styles.heading}>{copy.heading}</h2>
      </div>

      <div className={`container ${styles.layout}`}>
        <div ref={sectionRef} className={styles.grid}>
          {isLoading && <BlogSkeleton />}

          {isError && (
            <p className={styles.noResults}>
              Couldn&apos;t load articles right now ({error.message}).
            </p>
          )}

          {!isLoading && !isError && (
            filteredPosts.length > 0 ? (
              filteredPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} inView={inView} />
              ))
            ) : (
              <p className={styles.noResults}>{copy.noResultsText}</p>
            )
          )}
        </div>

        <BlogSidebar initialQuery={query} onSearch={setQuery} />
      </div>
    </section>
  )
}