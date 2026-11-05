import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

// /robots.txt: everything public may be indexed except the CMS and the site's data address.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
