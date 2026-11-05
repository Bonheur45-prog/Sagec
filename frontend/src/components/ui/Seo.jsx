import { Helmet } from 'react-helmet-async'
import { useSeoSettings } from '@hooks/useSeo'
import { mediaURL } from '@lib/api'

const SITE_NAME = 'SAGEC Ltd'
const DEFAULT_DESCRIPTION =
  "SAGEC Ltd — Architectural and Engineering Solutions. Rwanda's leading firm delivering innovative architecture, engineering, and construction excellence in Kigali."
const DEFAULT_IMAGE = '/og-image.jpg'

// Set VITE_SITE_URL in .env to your real production domain once you have
// one — used to build absolute URLs for canonical/OG tags. Falls back to
// the current origin so this still works correctly in local dev.
const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

/**
 * Drop this at the top of any page component to set that page's title,
 * meta description, canonical URL, and social-share (Open Graph/Twitter)
 * tags. Overrides the generic defaults baked into index.html.
 *
 * <Seo pageKey="about" title="About Us" description="..." path="/about" />
 *
 * `pageKey` links the page to its entry in the CMS (SEO Settings global).
 * (title/description written here are the fallback if the CMS field is blank)
 * <Seo title={post.title} description={post.excerpt} path={`/blog/${post.slug}`} image={mediaURL(post.coverImage?.url)} />
 */
export default function Seo({ pageKey, title, description, path = '', image, noIndex = false }) {
  // Only static pages have a pageKey — detail pages (project/service/blog)
  // pass their own title/description/image and use the site-wide settings.
  const { data: settings } = useSeoSettings()
  const page = pageKey ? settings?.[pageKey] : undefined

  const siteName = settings?.siteName || SITE_NAME
  const finalTitle = page?.title || title
  const finalDescription = page?.description || description || settings?.defaultDescription || DEFAULT_DESCRIPTION
  const finalImage = mediaURL(page?.image?.url) || image || mediaURL(settings?.defaultImage?.url) || DEFAULT_IMAGE

  const fullTitle = finalTitle ? `${finalTitle} — ${siteName}` : `${siteName} — Building Excellence`
  const url = `${SITE_URL}${path}`
  const absoluteImage = finalImage.startsWith('http') ? finalImage : `${SITE_URL}${finalImage}`
  const description_ = finalDescription

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description_} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description_} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:type" content="website" />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description_} />
      <meta name="twitter:image" content={absoluteImage} />
    </Helmet>
  )
}
