#!/usr/bin/env node
/**
 * Generates public/sitemap.xml and public/robots.txt from live CMS data.
 * ─────────────────────────────────────────────────────────────
 * Run with: npm run generate:sitemap
 *
 * This needs two env vars (same ones the app itself uses):
 *   VITE_API_URL  — your Payload CMS URL (e.g. https://cms.sagec.com)
 *   VITE_SITE_URL — your live frontend URL (e.g. https://sagec.com)
 *
 * It fetches every published project, service, and blog post slug
 * from the CMS and combines them with the site's static routes to
 * build a complete sitemap. Run this once per deploy (e.g. as a
 * "prebuild" step in CI) so the sitemap never goes stale — it's a
 * plain Node script, not part of the Vite build itself, since it
 * needs the CMS to be reachable over the network to run at all.
 * ─────────────────────────────────────────────────────────────
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(__dirname, '../.env') })

const API_URL = process.env.VITE_API_URL
const SITE_URL = process.env.VITE_SITE_URL

if (!API_URL || !SITE_URL) {
  console.error(
    'Missing VITE_API_URL and/or VITE_SITE_URL in .env — set both before running this script.\n' +
    'Example:\n  VITE_API_URL=https://cms.sagec.com\n  VITE_SITE_URL=https://sagec.com',
  )
  process.exit(1)
}

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/projects', priority: '0.9', changefreq: 'weekly' },
  { path: '/testimonials', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'yearly' },
  { path: '/careers', priority: '0.5', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
]

async function fetchSlugs(collection) {
  try {
    const res = await fetch(`${API_URL}/api/${collection}?limit=200&depth=0`)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data = await res.json()
    return (data.docs ?? []).map((doc) => doc.slug).filter(Boolean)
  } catch (err) {
    console.warn(`  couldn't fetch "${collection}" (${err.message}) — skipping those URLs.`)
    return []
  }
}

async function run() {
  console.log(`Fetching content from ${API_URL} ...`)
  const [projectSlugs, serviceSlugs, blogSlugs] = await Promise.all([
    fetchSlugs('projects'),
    fetchSlugs('services'),
    fetchSlugs('blog-posts'),
  ])

  const urls = [
    ...STATIC_ROUTES,
    ...projectSlugs.map((slug) => ({ path: `/projects/${slug}`, priority: '0.7', changefreq: 'monthly' })),
    ...serviceSlugs.map((slug) => ({ path: `/services/${slug}`, priority: '0.7', changefreq: 'monthly' })),
    ...blogSlugs.map((slug) => ({ path: `/blog/${slug}`, priority: '0.6', changefreq: 'monthly' })),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url><loc>${SITE_URL}${u.path}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n')

  const publicDir = path.resolve(__dirname, '../public')
  fs.mkdirSync(publicDir, { recursive: true })
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml)

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots)

  console.log(`\nWrote sitemap.xml with ${urls.length} URLs (${projectSlugs.length} projects, ${serviceSlugs.length} services, ${blogSlugs.length} blog posts) and robots.txt ✓`)
}

run()
