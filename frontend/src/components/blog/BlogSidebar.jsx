import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Tag } from 'lucide-react'
import { useBlogPosts, blogPostQuery } from '@hooks/useBlog'
import { useTags } from '@hooks/useBlog'
import { usePrefetch } from '@hooks/usePrefetch'
import { mediaURL } from '@lib/api'
import { useBlogCopy } from '@hooks/useBlogPage'
import styles from './BlogSidebar.module.css'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatDateBadge(dateStr) {
  const d = new Date(dateStr)
  return { day: d.getDate(), month: MONTHS[d.getMonth()] }
}

/**
 * Shared between BlogGrid (list page) and BlogPostContent (detail page).
 * `excludeId`: omit the current post from its own "Popular Posts" list.
 * `initialQuery`: pre-fill the search input (used by BlogGrid when
 * arriving via /blog?q=...).
 * `onSearch`: if provided (BlogGrid only), filters in place instead of
 * navigating — lets the grid page update live as you type.
 *
 * "Popular Posts" is sorted by most recent rather than comment count —
 * comments now live in their own collection (BlogComments), not
 * embedded on the post, so a comment-count sort would mean an extra
 * fetch per post just to rank a sidebar widget. Recency is a
 * reasonable, cheap stand-in and needs nothing beyond the same
 * useBlogPosts() list every other blog section already fetches.
 */
export default function BlogSidebar({ excludeId, initialQuery = '', onSearch }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialQuery)
  const prefetch = usePrefetch()
  const copy = useBlogCopy('grid')

  // Same queryKey as BlogGrid/BlogPostContent — React Query dedupes
  // this into a single network request no matter how many of these
  // are mounted on the page at once.
  const { data: posts } = useBlogPosts()
  const { data: tags } = useTags()

  const popularPosts = (posts ?? [])
    .filter((p) => p.id !== excludeId)
    .slice(0, 3)

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    if (onSearch) onSearch(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!onSearch) {
      navigate(`/blog?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.widget}>
        <form className={styles.searchBox} onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={copy.searchPlaceholder}
            aria-label="Search blog posts"
          />
          <button type="submit" className={styles.searchIcon} aria-label="Search">
            <Search size={16} />
          </button>
        </form>
      </div>

      {popularPosts.length > 0 && (
        <div className={styles.widget}>
          <h4 className={styles.widgetTitle}>{copy.popularPostsLabel}</h4>
          <ul className={styles.popularList}>
            {popularPosts.map((post) => {
              const { day, month } = formatDateBadge(post.publishedAt)
              return (
                <li key={post.id}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className={styles.popularItem}
                    onMouseEnter={() => prefetch(blogPostQuery(post.slug))}
                    onFocus={() => prefetch(blogPostQuery(post.slug))}
                  >
                    <img src={mediaURL(post.coverImage?.url)} alt="" className={styles.popularThumb} />
                    <div>
                      <span className={styles.popularDate}>
                        {day} {month}
                      </span>
                      <p className={styles.popularTitle}>{post.title}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {tags?.length > 0 && (
        <div className={styles.widget}>
          <h4 className={styles.widgetTitle}>{copy.popularTagsLabel}</h4>
          <div className={styles.tagCloud}>
            {tags.map((tag) => (
              <span key={tag.id} className={styles.tagPill}>
                <Tag size={11} /> {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}