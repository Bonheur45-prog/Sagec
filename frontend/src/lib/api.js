import { apiClient, CMS_BASE_URL } from './apiClient'

/**
 * Fetches a Payload global (a page's page-level content: hero copy,
 * section headings, closing CTAs, etc). Globals return a single object,
 * not a `{ docs: [...] }` list.
 *
 * queryString is passed through as-is, e.g. '?depth=2' — build any
 * where-clauses by hand (see fetchCollection below for the pattern),
 * Payload's REST API expects bracket notation like
 * `where[slug][equals]=foo`, which doesn't come out of a plain params
 * object without extra tooling, so plain strings are simplest here.
 */
export async function fetchGlobal(slug, queryString = '') {
  const { data } = await apiClient.get(`/globals/${slug}${queryString}`)
  return data
}

/**
 * Fetches a Payload collection. Returns the raw response body
 * ({ docs, totalDocs, limit, ... }) — callers pull `.docs` themselves,
 * since some callers want the full pagination info and some don't.
 */
export async function fetchCollection(slug, queryString = '') {
  const { data } = await apiClient.get(`/${slug}${queryString}`)
  return data
}

/**
 * Creates a document in a Payload collection — e.g. submitting a blog
 * comment. Only usable against collections whose `access.create` allows
 * it for unauthenticated requests (BlogComments does, by design: public
 * visitors can submit, new comments start unapproved and stay invisible
 * on the public site until approved in the admin).
 */
export async function createDoc(slug, body) {
  const { data } = await apiClient.post(`/${slug}`, body)
  return data
}

/**
 * Resolves a Payload media URL to something displayable in <img src>.
 * Works whether Media is using local disk storage (relative URL, needs
 * the CMS origin prefixed) or Cloudinary (already a full https:// URL) —
 * components never need to know or care which one is active.
 *
 * Takes the URL string itself (e.g. `service.image?.url`), not the
 * whole media object — keeps call sites explicit about what they're
 * passing, and works the same for any upload field regardless of its
 * field name (image, detailImage, coverImage, avatar, etc).
 */
export function mediaURL(url) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${CMS_BASE_URL}${url}`
}

/**
 * Resolves a Payload media DOC (not just a url string) to a resized
 * variant's URL when one exists (see Media.ts `imageSizes`), falling
 * back to the original — needed for cards/thumbnails/sliders that
 * don't need a full-resolution original. Media uploaded before
 * imageSizes was added won't have `sizes` populated yet, so the
 * fallback keeps those working unchanged.
 */
export function mediaThumbURL(mediaDoc, size = 'card') {
  const url = mediaDoc?.sizes?.[size]?.url || mediaDoc?.url
  return mediaURL(url)
}