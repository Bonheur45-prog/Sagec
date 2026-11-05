import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import {
  Calendar,
  User,
  MessageCircle,
  Check,
  Quote,
  Facebook,
  Instagram,
  Linkedin,
  X,
  ArrowLeft,
  ArrowRight,
  Send,
} from 'lucide-react'
import BlogSidebar from '@components/blog/BlogSidebar'
import PageLoader from '@components/ui/PageLoader'
import Seo from '@components/ui/Seo'
import { getInitials } from '@utils/text'
import { mediaURL } from '@lib/api'
import {
  useBlogPost,
  useBlogPosts,
  useBlogComments,
  useSubmitComment,
  blogPostQuery,
} from '@hooks/useBlog'
import { usePrefetch } from '@hooks/usePrefetch'
import { useBlogCopy } from '@hooks/useBlogPage'
import styles from './BlogPostContent.module.css'

const socialIcons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, x: X }

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── CONTENT BLOCKS ─────────────────────────────────────────
// Payload's `blocks` field type identifies each row by `blockType`,
// not `type` — the old static data used `type` since it was hand-
// written, but the real API response shape uses `blockType`.
function ContentBlock({ block }) {
  switch (block.blockType) {
    case 'paragraph':
      return <p className={styles.paragraph}>{block.text}</p>
    case 'heading':
      return <h3 className={styles.subheading}>{block.text}</h3>
    case 'image':
      return (
        <figure className={styles.imageBlock}>
          <img src={mediaURL(block.image?.url)} alt={block.caption || ''} />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      )
    case 'checklist':
      // items is [{id, text}], not plain strings
      return (
        <ul className={styles.checklist}>
          {(block.items ?? []).map((item, i) => (
            <li key={item.id ?? i}>
              <Check size={16} />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )
    case 'quote':
      return (
        <blockquote className={styles.quoteBlock}>
          <Quote size={28} className={styles.quoteIcon} aria-hidden="true" />
          <p>{block.text}</p>
          {block.author && <cite>— {block.author}</cite>}
        </blockquote>
      )
    case 'gallery':
      // images is [{id, image}], each `image` a media relation
      return (
        <div className={styles.galleryBlock}>
          {(block.images ?? []).map((img, i) => (
            <img key={img.id ?? i} src={mediaURL(img.image?.url)} alt="" />
          ))}
        </div>
      )
    default:
      return null
  }
}

// ── COMMENT FORM (live) ────────────────────────────────────
function CommentForm({ postId }) {
  const copy = useBlogCopy('post')
  const [form, setForm] = useState({ name: '', email: '', website: '', message: '' })
  const { mutate, isPending } = useSubmitComment(postId)

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    mutate(
      { name: form.name, email: form.email, website: form.website, text: form.message },
      { onSuccess: () => setForm({ name: '', email: '', website: '', message: '' }) },
    )
  }

  return (
    <form className={styles.commentForm} onSubmit={handleSubmit}>
      <h4 className={styles.commentFormTitle}>{copy.leaveCommentLabel}</h4>
      <div className={styles.formRow}>
        <input
          type="text"
          placeholder={copy.commentNameLabel}
          value={form.name}
          onChange={handleChange('name')}
          required
        />
        <input
          type="email"
          placeholder={copy.commentEmailLabel}
          value={form.email}
          onChange={handleChange('email')}
          required
        />
      </div>
      <input
        type="text"
        placeholder={copy.commentWebsiteLabel}
        value={form.website}
        onChange={handleChange('website')}
        className={styles.fullWidthInput}
      />
      <textarea
        placeholder={copy.commentMessageLabel}
        value={form.message}
        onChange={handleChange('message')}
        rows={5}
        required
      />
      <button type="submit" className={styles.submitBtn} disabled={isPending}>
        {isPending ? 'Posting…' : copy.commentSubmitLabel} <Send size={15} />
      </button>
      <p className={styles.formDisclaimer}>{copy.commentFormDisclaimer}</p>
    </form>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function BlogPostContent() {
  const copy = useBlogCopy('post')
  const { slug } = useParams()
  const { data: post, isLoading, isError, error } = useBlogPost(slug)
  const { data: allPosts } = useBlogPosts()
  const { data: comments } = useBlogComments(post?.id)
  const prefetch = usePrefetch()

  if (isLoading) return <PageLoader />

  if (isError) {
    return (
      <section className={styles.section}>
        <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <p>Couldn&apos;t load this article right now ({error.message}).</p>
        </div>
      </section>
    )
  }

  if (!post) {
    return (
      <section className={styles.section}>
        <div className={`container ${styles.notFound}`}>
          <p>{copy.notFoundText}</p>
          <Link to="/blog" className={styles.backLink}>
            <ArrowLeft size={16} /> {copy.backToBlogLabel}
          </Link>
        </div>
      </section>
    )
  }

  const author = post.author
  const currentIndex = (allPosts ?? []).findIndex((p) => p.slug === slug)
  const prevPost =
    allPosts && currentIndex > 0 ? allPosts[(currentIndex - 1 + allPosts.length) % allPosts.length] : null
  const nextPost =
    allPosts && currentIndex >= 0 ? allPosts[(currentIndex + 1) % allPosts.length] : null

  const shareUrl =
    typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''
  const shareText = encodeURIComponent(post.title)
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    instagram: '#',
    x: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
  }

  return (
    <section className={styles.section}>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${slug}`}
        image={mediaURL(post.coverImage?.url)}
      />
      <div className={`container ${styles.layout}`}>
        <article className={styles.article}>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <User size={14} /> {author?.name ?? 'SAGEC Team'}
            </span>
            <span className={styles.metaItem}>
              <Calendar size={14} /> {formatDate(post.publishedAt)}
            </span>
            <span className={styles.metaItem}>
              <MessageCircle size={14} /> {comments?.length ?? 0}
            </span>
          </div>

          <div className={styles.content}>
            {(post.content ?? []).map((block, i) => (
              <ContentBlock key={block.id ?? i} block={block} />
            ))}
          </div>

          <div className={styles.tagsShareRow}>
            <div className={styles.tags}>
              {(post.tags ?? []).map((tag) => (
                <span key={tag.id} className={styles.tagPill}>
                  {tag.name}
                </span>
              ))}
            </div>
            <div className={styles.share}>
              <span className={styles.shareLabel}>{copy.shareLabel}</span>
              {Object.entries(shareLinks).map(([key, href]) => {
                const Icon = socialIcons[key]
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${key}`}
                    className={styles.shareIcon}
                  >
                    <Icon size={15} />
                  </a>
                )
              })}
            </div>
          </div>

          {author && (
            <div className={styles.authorBio}>
              <div className={styles.authorAvatar}>
                {author.avatar ? (
                  <img src={mediaURL(author.avatar.url)} alt={author.name} />
                ) : (
                  <span>{getInitials(author.name)}</span>
                )}
              </div>
              <div>
                <p className={styles.authorName}>{author.name}</p>
                <p className={styles.authorRole}>{author.role}</p>
                <p className={styles.authorBioText}>{author.bio}</p>
                <div className={styles.authorSocials}>
                  {(author.socials ?? []).map(({ iconKey, href }) => {
                    const Icon = socialIcons[iconKey]
                    return (
                      <a key={iconKey} href={href} aria-label={iconKey} className={styles.shareIcon}>
                        <Icon size={14} />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {prevPost && nextPost && (
            <nav className={styles.prevNext} aria-label={copy.relatedPostsLabel}>
              <Link
                to={`/blog/${prevPost.slug}`}
                className={styles.prevNextLink}
                onMouseEnter={() => prefetch(blogPostQuery(prevPost.slug))}
                onFocus={() => prefetch(blogPostQuery(prevPost.slug))}
              >
                <ArrowLeft size={16} />
                <div>
                  <span className={styles.prevNextLabel}>Previous</span>
                  <p className={styles.prevNextTitle}>{prevPost.title}</p>
                </div>
              </Link>
              <Link
                to={`/blog/${nextPost.slug}`}
                className={`${styles.prevNextLink} ${styles.next}`}
                onMouseEnter={() => prefetch(blogPostQuery(nextPost.slug))}
                onFocus={() => prefetch(blogPostQuery(nextPost.slug))}
              >
                <div>
                  <span className={styles.prevNextLabel}>Next</span>
                  <p className={styles.prevNextTitle}>{nextPost.title}</p>
                </div>
                <ArrowRight size={16} />
              </Link>
            </nav>
          )}

          <div className={styles.comments}>
            <h3 className={styles.commentsTitle}>
              {copy.commentsLabel} ({comments?.length ?? 0})
            </h3>
            {(comments ?? []).map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentAvatar}>
                  {comment.avatar ? (
                    <img src={mediaURL(comment.avatar.url)} alt={comment.name} />
                  ) : (
                    <span>{getInitials(comment.name)}</span>
                  )}
                </div>
                <div className={styles.commentBody}>
                  <div className={styles.commentHeader}>
                    <div>
                      <p className={styles.commentName}>{comment.name}</p>
                      <p className={styles.commentDate}>{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  <p className={styles.commentText}>{comment.text}</p>
                </div>
              </div>
            ))}

            <CommentForm postId={post.id} />
          </div>
        </article>

        <BlogSidebar excludeId={post.id} />
      </div>
    </section>
  )
}