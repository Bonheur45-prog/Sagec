import 'server-only';
import type { Metadata } from 'next';
import { cache } from 'react';
import { prisma } from '@/lib/db';
import { mediaUrl } from '@/lib/media';
import { pageGlobal } from './payload';

/*
 * Titles, descriptions and share previews, written into the page by the server.
 * Order of choice for each page:
 *   1. CMS → Pages → Search & sharing → that page (title / description / image)
 *   2. what the page itself passes (a project's or article's own title and photo)
 *   3. Search & sharing defaults, then CMS → Site settings (default title, description, share image)
 * Titles use the pattern from Site settings ("%s — SAGEC Ltd").
 */

export const siteUrl = () => (process.env.SITE_URL || 'https://sagecltd.com').replace(/\/+$/, '');

type Media = { url?: string } | null | undefined;
type SeoEntry = { title?: string; description?: string; image?: Media };

const loadSeo = cache(async () => {
  const [settings, seo] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null),
    pageGlobal('seo-settings').catch(() => ({}) as Record<string, unknown>),
  ]);
  let settingsImage: string | null = null;
  if (settings?.defaultOgMediaId) {
    const m = await prisma.mediaAsset.findFirst({ where: { id: settings.defaultOgMediaId, deletedAt: null } }).catch(() => null);
    try {
      settingsImage = m ? mediaUrl(m.objectKey) : null;
    } catch {
      settingsImage = null;
    }
  }
  return { settings, seo: seo as Record<string, unknown>, settingsImage };
});

export type SeoInput = {
  /** Key in Search & sharing: home, about, services, projects, testimonials, blog, contact. */
  pageKey?: string;
  title?: string;
  description?: string;
  image?: string | null;
  path: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
};

const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export async function buildMetadata(input: SeoInput): Promise<Metadata> {
  const { settings, seo, settingsImage } = await loadSeo();
  const entry = (input.pageKey ? (seo[input.pageKey] as SeoEntry | undefined) : undefined) ?? {};
  const siteName = clean(seo.siteName) || settings?.companyName || 'SAGEC Ltd';
  const template = settings?.titleTemplate?.includes('%s') ? settings.titleTemplate : `%s — ${siteName}`;

  const pageTitle = clean(entry.title) || clean(input.title);
  const title = pageTitle ? template.replace('%s', pageTitle) : settings?.seoTitle || `${siteName} — Building Excellence`;
  const description =
    clean(entry.description) || clean(input.description) || clean(seo.defaultDescription) || settings?.seoDescription || '';
  const image = entry.image?.url || input.image || (seo.defaultImage as Media)?.url || settingsImage || '/og-image.jpg';
  const url = `${siteUrl()}${input.path === '/' ? '' : input.path}` || siteUrl();

  return {
    metadataBase: new URL(siteUrl()),
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: input.type ?? 'website',
      images: [{ url: image }],
      locale: 'en_RW',
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    verification: settings?.googleSiteVerification ? { google: settings.googleSiteVerification } : undefined,
  };
}
