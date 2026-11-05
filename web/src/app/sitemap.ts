import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { siteUrl } from '@/lib/site/seo';

// /sitemap.xml for search engines: the main pages plus every published service, project and article.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const live = { status: 'PUBLISHED' as const, deletedAt: null };
  const pages = ['', '/about', '/services', '/projects', '/testimonials', '/careers', '/blog', '/contact'].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : 0.8,
  }));
  try {
    const [services, projects, posts] = await Promise.all([
      prisma.service.findMany({ where: live, select: { slug: true, updatedAt: true } }),
      prisma.project.findMany({ where: live, select: { slug: true, updatedAt: true } }),
      prisma.post.findMany({ where: { ...live, noIndex: false, canonicalUrl: '', publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }),
    ]);
    return [
      ...pages,
      ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: s.updatedAt, priority: 0.7 })),
      ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
      ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ];
  } catch {
    return pages;
  }
}
