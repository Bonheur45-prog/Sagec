import 'server-only';
import type { MediaAsset } from '@prisma/client';
import { prisma } from '@/lib/db';
import { mediaUrl, parseVariants } from '@/lib/media';
import { getPublishedPage, type PageSlug } from '@/lib/pages/store';
import { isPageSlug, mediaFieldPaths } from '@/lib/pages/schema';

/*
 * The public site's components were written against Payload's REST API. This module answers the same
 * requests from PostgreSQL and returns records in the same shapes, so the components work unchanged:
 *   GET /api/globals/<page>   → a page's texts (published, or SAGEC's starter text)
 *   GET /api/<collection>?…   → { docs: [...] } for services, projects, testimonials, partners, jobs,
 *                                blog-posts, blog-comments, tags
 * Only published, non-trashed records are ever returned.
 */

type Doc = Record<string, unknown>;

// ───── Media ─────

export type PublicMedia = { id: string; url: string; alt: string; width: number; height: number; mimeType: string; sizes: Record<string, { url: string; width: number }> };

/** A stored file as Payload's media object. The smaller WebP copies stand in for Payload's image sizes. */
export function toMedia(m: MediaAsset | null | undefined): PublicMedia | null {
  if (!m || m.deletedAt) return null;
  try {
    const variants = parseVariants(m.variants);
    const pick = (w: number) => variants.find((v) => v.w >= w) ?? null;
    const size = (w: number) => {
      const v = pick(w);
      return v ? { url: mediaUrl(v.key), width: v.w } : { url: mediaUrl(m.objectKey), width: m.width };
    };
    return {
      id: m.id,
      url: mediaUrl(m.objectKey),
      alt: m.alt,
      width: m.width,
      height: m.height,
      mimeType: m.mimeType,
      sizes: { thumbnail: size(480), card: size(960), tablet: size(1600) },
    };
  } catch {
    return null; // R2 address not configured: the site shows its built-in images instead
  }
}

async function mediaMap(ids: (string | null | undefined)[]): Promise<Map<string, PublicMedia>> {
  const list = [...new Set(ids.filter((v): v is string => !!v))];
  const rows = list.length ? await prisma.mediaAsset.findMany({ where: { id: { in: list }, deletedAt: null } }) : [];
  const map = new Map<string, PublicMedia>();
  for (const r of rows) {
    const m = toMedia(r);
    if (m) map.set(r.id, m);
  }
  return map;
}

// ───── Page texts ─────

/** A page's texts with every photo/video id replaced by its media object (missing files become null). */
export async function pageGlobal(slug: PageSlug): Promise<Doc> {
  const doc = structuredClone(await getPublishedPage(slug)) as Doc;
  const paths = mediaFieldPaths(slug);
  const ids: string[] = [];
  const visit = (node: unknown, path: string[], fn: (holder: Doc, key: string) => void) => {
    if (!node || typeof node !== 'object') return;
    const [head, ...rest] = path;
    if (Array.isArray(node)) {
      for (const item of node) visit(item, path, fn);
      return;
    }
    const o = node as Doc;
    if (!rest.length) fn(o, head);
    else visit(o[head], rest, fn);
  };
  for (const p of paths) visit(doc, p, (o, k) => typeof o[k] === 'string' && ids.push(o[k] as string));
  const media = await mediaMap(ids);
  for (const p of paths) visit(doc, p, (o, k) => {
    if (typeof o[k] === 'string') o[k] = media.get(o[k] as string) ?? null;
  });
  return doc;
}

/** Company details in the shape of the old CompanyInfo global, from Site settings. */
export async function companyInfo(): Promise<Doc> {
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const socials = Array.isArray(s?.socials) ? (s!.socials as { platform: string; url: string }[]) : [];
  const address = [s?.addressStreet, s?.addressCity, s?.addressCountry].filter(Boolean).join(', ');
  return {
    tagline: s?.footerDescription || s?.tagline || '',
    phone: s?.phone ?? '',
    email: s?.publicEmail ?? '',
    address,
    whatsappNumber: s?.whatsappNumber ?? '',
    whatsappLabel: s?.whatsappLabel ?? '',
    responseNote: s?.responseNote ?? '',
    businessHours: Array.isArray(s?.businessHours) ? s!.businessHours : [],
    // The site draws an icon per key; X and the others keep their key, WhatsApp comes from the number.
    socials: socials.map((x) => ({ iconKey: x.platform, href: x.url })),
  };
}

// ───── Collections ─────

const live = { status: 'PUBLISHED' as const, deletedAt: null };
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

async function services(where: object = {}): Promise<Doc[]> {
  const rows = await prisma.service.findMany({ where: { ...live, ...where }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  const media = await mediaMap(rows.flatMap((r) => [r.coverMediaId, r.detailMediaId]));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    order: r.sortOrder,
    description: r.shortDescription,
    iconKey: r.icon,
    image: r.coverMediaId ? (media.get(r.coverMediaId) ?? null) : null,
    detailImage: r.detailMediaId ? (media.get(r.detailMediaId) ?? null) : r.coverMediaId ? (media.get(r.coverMediaId) ?? null) : null,
    deliverables: strings(r.deliverables).map((text) => ({ text })),
    showOnHome: r.showOnHome,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
  }));
}

async function projects(where: object = {}): Promise<Doc[]> {
  const rows = await prisma.project.findMany({
    where: { ...live, ...where },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { gallery: { orderBy: { position: 'asc' } }, services: { include: { service: { select: { id: true, title: true, slug: true, status: true, deletedAt: true } } } } },
  });
  const media = await mediaMap(rows.flatMap((r) => [r.coverMediaId, r.featuredMediaId, ...r.gallery.map((g) => g.mediaId)]));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    order: r.sortOrder,
    featured: r.featured,
    category: r.category,
    status: r.state === 'IN_PROGRESS' ? 'In Progress' : 'Completed',
    progress: r.progress,
    year: r.year,
    location: r.location,
    client: r.client,
    area: r.area,
    shortDescription: r.shortDescription,
    // The project page splits this on blank lines into paragraphs.
    description: strings(r.paragraphs).join('\n\n'),
    highlights: strings(r.highlights),
    coverImage: r.coverMediaId ? (media.get(r.coverMediaId) ?? null) : null,
    featuredImage: r.featuredMediaId ? (media.get(r.featuredMediaId) ?? null) : r.coverMediaId ? (media.get(r.coverMediaId) ?? null) : null,
    gallery: r.gallery.map((g) => ({ id: `${r.id}-${g.position}`, image: media.get(g.mediaId) ?? null })).filter((g) => g.image),
    services: r.services.filter((s) => s.service.status === 'PUBLISHED' && !s.service.deletedAt).map((s) => ({ id: s.service.id, title: s.service.title, slug: s.service.slug })),
    showOnHome: r.showOnHome,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
  }));
}

async function testimonials(): Promise<Doc[]> {
  const rows = await prisma.testimonial.findMany({ where: live, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  const media = await mediaMap(rows.map((r) => r.avatarMediaId));
  return rows.map((r) => ({ id: r.id, name: r.name, role: r.role, quote: r.quote, order: r.sortOrder, showOnHome: r.showOnHome, avatar: r.avatarMediaId ? (media.get(r.avatarMediaId) ?? null) : null }));
}

async function partners(): Promise<Doc[]> {
  const rows = await prisma.partner.findMany({ where: live, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  const media = await mediaMap(rows.map((r) => r.logoMediaId));
  return rows.map((r) => ({ id: r.id, name: r.name, website: r.website, order: r.sortOrder, logo: r.logoMediaId ? (media.get(r.logoMediaId) ?? null) : null }));
}

async function jobs(): Promise<Doc[]> {
  const rows = await prisma.job.findMany({ where: live, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    department: r.department,
    type: r.type,
    location: r.location,
    description: r.description,
    requirements: strings(r.requirements).map((requirement, i) => ({ id: `${r.id}-${i}`, requirement })),
    applyEmail: r.applyEmail,
    applyLink: r.applyLink,
    status: 'open',
    order: r.sortOrder,
  }));
}

const tagSlug = (t: string) => t.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Published articles whose date has come (scheduled ones stay hidden until then), newest first. */
async function blogPosts(where: object = {}): Promise<Doc[]> {
  const rows = await prisma.post.findMany({
    where: { ...live, publishedAt: { lte: new Date() }, ...where },
    orderBy: { publishedAt: 'desc' },
    include: { category: { select: { name: true, slug: true } }, author: true },
  });
  const media = await mediaMap(rows.flatMap((r) => [r.coverMediaId, r.ogMediaId, r.author?.avatarMediaId]));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    publishedAt: r.publishedAt!.toISOString(),
    category: r.category.name,
    categorySlug: r.category.slug,
    tags: r.tags.map((name) => ({ id: tagSlug(name), name, slug: tagSlug(name) })),
    author: r.author
      ? {
          id: r.author.id,
          name: r.author.name,
          role: r.author.role,
          bio: r.author.bio,
          avatar: r.author.avatarMediaId ? (media.get(r.author.avatarMediaId) ?? null) : null,
          socials: (Array.isArray(r.author.socials) ? (r.author.socials as { platform: string; url: string }[]) : []).map((x) => ({ iconKey: x.platform, href: x.url })),
        }
      : { id: 'team', name: 'SAGEC Team', role: '', bio: '', avatar: null, socials: [] },
    excerpt: r.excerpt,
    featured: r.featured,
    readingMinutes: r.readingMinutes,
    coverImage: r.coverMediaId ? (media.get(r.coverMediaId) ?? null) : null,
    // The editor's HTML (rendered with a strict whitelist on save) and its table of contents.
    html: r.html,
    toc: r.toc,
    content: [],
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
    ogImage: r.ogMediaId ? (media.get(r.ogMediaId) ?? null) : null,
    canonicalUrl: r.canonicalUrl,
    noIndex: r.noIndex,
  }));
}

async function blogComments(postId: string): Promise<Doc[]> {
  const rows = await prisma.blogComment.findMany({ where: { postId, approved: true, post: live }, orderBy: { createdAt: 'desc' } });
  return rows.map((r) => ({ id: r.id, name: r.name, text: r.text, website: r.website, createdAt: r.createdAt.toISOString(), avatar: null, approved: true }));
}

async function tags(): Promise<Doc[]> {
  const rows = await prisma.post.findMany({ where: { ...live, publishedAt: { lte: new Date() } }, select: { tags: true } });
  const names = [...new Set(rows.flatMap((r) => r.tags))].sort((a, b) => a.localeCompare(b));
  return names.map((name) => ({ id: tagSlug(name), name, slug: tagSlug(name) }));
}

// ───── The REST API shape ─────

const docs = (list: Doc[]) => ({ docs: list, totalDocs: list.length, limit: list.length, page: 1, totalPages: 1 });

/** Payload's `where[field][equals]=value` for the one field the site filters on. */
function whereEquals(params: URLSearchParams, field: string): string | null {
  return params.get(`where[${field}][equals]`);
}

/** Answers GET /api/<path>?<query> in Payload's format; null when the path is unknown. */
export async function payloadGet(path: string[], params: URLSearchParams): Promise<unknown | null> {
  const [first, second] = path;
  if (first === 'globals' && second) {
    if (second === 'company-info') return companyInfo();
    if (isPageSlug(second)) return pageGlobal(second);
    return null;
  }
  if (path.length !== 1) return null;
  const slug = whereEquals(params, 'slug');
  switch (first) {
    case 'services':
      return docs(await services(slug ? { slug } : {}));
    case 'projects':
      return docs(await projects(slug ? { slug } : {}));
    case 'testimonials':
      return docs(await testimonials());
    case 'partners':
      return docs(await partners());
    case 'jobs':
      return docs(await jobs());
    case 'blog-posts':
      return docs(await blogPosts(slug ? { slug } : {}));
    case 'blog-comments': {
      const post = whereEquals(params, 'post');
      return docs(post && /^[a-z0-9]{10,40}$/.test(post) ? await blogComments(post) : []);
    }
    case 'tags':
      return docs(await tags());
    default:
      return null;
  }
}
