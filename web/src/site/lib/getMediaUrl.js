import { CMS_BASE_URL } from './apiClient'

/**
 * Resolves a Payload media doc (or media relationship) to a displayable
 * <img src> URL — works whether Media is using Payload's local disk
 * storage (relative URL, needs the CMS origin prefixed) or Cloudinary
 * (already a full https:// URL, used as-is). Frontend code never needs
 * to know or care which one is active.
 *
 * Accepts:
 *   - a populated media object: { url: '/media/foo.jpg', alt: '...' }
 *   - a raw string URL
 *   - null/undefined (returns '')
 */
export function getMediaUrl(media) {
  if (!media) return ''
  const url = typeof media === 'string' ? media : media.url
  if (!url) return ''
  return url.startsWith('http') ? url : `${CMS_BASE_URL}${url}`
}

/**
 * Convenience helper for alt text, since it's nearly always read
 * alongside the URL and falls back sensibly when missing.
 */
export function getMediaAlt(media, fallback = '') {
  if (!media || typeof media === 'string') return fallback
  return media.alt || fallback
}