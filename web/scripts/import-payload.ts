/*
 * Copies SAGEC's content from the old Payload CMS into this CMS (PostgreSQL + Cloudflare R2).
 *
 *   PAYLOAD_URL=https://old-cms.example.com npm run import:payload -- --check   # look only, change nothing
 *   PAYLOAD_URL=https://old-cms.example.com npm run import:payload              # copy everything
 *
 * It reads the old CMS through its web address (the same API the old website used), so it needs neither
 * the MongoDB password nor the old server's files: every photo and video is downloaded from the old CMS,
 * resized like a normal upload and stored in R2.
 *
 * Optional PAYLOAD_EMAIL and PAYLOAD_PASSWORD (an admin login of the old CMS) also bring over what the
 * public cannot see: contact messages, comments waiting for approval, closed job openings.
 *
 * Copied: company details → Site settings; every page's texts and photos (published, with a version note);
 * services, projects (with galleries), testimonials, partners, job openings; blog authors, categories and
 * articles (the old content blocks become the new editor's format); comments; contact messages.
 *
 * Safe to run again: anything already copied (same address, name or file) is skipped, never duplicated.
 * Page texts are only written when the page has not been edited in the new CMS yet (use --pages to
 * overwrite them anyway).
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/db';
import { buildSrcSet, mediaUrl, parseVariants } from '../src/lib/media';
import { renderDoc, type DocNode, type MediaInfo } from '../src/lib/blog/render';
import { slugify } from '../src/lib/cms/slug';
import { JOB_DEPARTMENTS, PROJECT_CATEGORIES, SERVICE_ICONS } from '../src/lib/cms/collections-validation';
import { PAGE_SLUGS, mediaFieldPaths, parsePage, type PageSlug } from '../src/lib/pages/schema';
import { processImage } from '../src/lib/storage/image';
import { newUploadId, newUploadKey, variantKeyFor } from '../src/lib/storage/keys';
import { putObject } from '../src/lib/storage/r2';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: variables come from the shell (or GitHub Actions).
}

const CHECK = process.argv.includes('--check');
const OVERWRITE_PAGES = process.argv.includes('--pages');
const BASE = (process.env.PAYLOAD_URL ?? '').trim().replace(/\/+$/, '').replace(/\/admin$/, '');
if (!/^https?:\/\//.test(BASE)) {
  console.error('Set PAYLOAD_URL to the old CMS address, e.g. PAYLOAD_URL=https://cms.example.com (the address you log in at, without /admin).');
  process.exit(1);
}

type Doc = Record<string, unknown>;
const obj = (v: unknown): Doc => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Doc) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, max = 5000): string => (typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : '');
const idOf = (v: unknown): string | null => (typeof v === 'string' || typeof v === 'number' ? String(v) : typeof obj(v).id === 'string' || typeof obj(v).id === 'number' ? String(obj(v).id) : null);

const counts: Record<string, { added: number; skipped: number }> = {};
const tally = (what: string, added: boolean) => {
  counts[what] ??= { added: 0, skipped: 0 };
  counts[what][added ? 'added' : 'skipped']++;
};
const warnings: string[] = [];
const warn = (text: string) => {
  warnings.push(text);
  console.warn(`  ! ${text}`);
};

// ───────────── Reading the old CMS ─────────────

let token = '';
async function api(path: string): Promise<Doc> {
  const res = await fetch(`${BASE}/api${path}`, { headers: token ? { Authorization: `JWT ${token}` } : {}, signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return (await res.json()) as Doc;
}

async function login() {
  const email = process.env.PAYLOAD_EMAIL;
  const password = process.env.PAYLOAD_PASSWORD;
  if (!email || !password) {
    console.log('No PAYLOAD_EMAIL / PAYLOAD_PASSWORD: copying public content only (no contact messages, unapproved comments or closed jobs).');
    return;
  }
  const res = await fetch(`${BASE}/api/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const body = obj(await res.json().catch(() => ({})));
  if (!res.ok || typeof body.token !== 'string') throw new Error('Could not log in to the old CMS: check PAYLOAD_EMAIL and PAYLOAD_PASSWORD.');
  token = body.token;
  console.log(`Logged in to the old CMS as ${email}.`);
}

/** Every document of a collection (all pages), with relations as ids. */
async function all(collection: string, optional = false): Promise<Doc[]> {
  const out: Doc[] = [];
  for (let page = 1; page < 100; page++) {
    let body: Doc;
    try {
      body = await api(`/${collection}?limit=100&page=${page}&depth=0&sort=createdAt`);
    } catch (error) {
      if (optional) {
        console.log(`  (${collection}: not readable — ${(error as Error).message}; skipped)`);
        return out;
      }
      throw error;
    }
    out.push(...arr(body.docs).map(obj));
    if (!body.hasNextPage) break;
  }
  return out;
}

async function global(slug: string): Promise<Doc> {
  return api(`/globals/${slug}?depth=0`).catch((error) => {
    warn(`page settings "${slug}" could not be read (${(error as Error).message})`);
    return {};
  });
}

// ───────────── Photos and videos ─────────────

const mediaMap = new Map<string, string | null>(); // old media id → new MediaAsset id (null = could not be copied)
const mediaDocs = new Map<string, Doc>();

/** Media copied by an earlier run (recorded in the activity log), so a second run reuses them. */
async function loadPreviousMedia() {
  const rows = await prisma.auditLog.findMany({ where: { action: 'media.import' }, select: { entityId: true, meta: true } });
  for (const r of rows) {
    const old = str(obj(r.meta).payloadId);
    if (old) mediaMap.set(old, r.entityId);
  }
  if (rows.length) {
    const alive = new Set((await prisma.mediaAsset.findMany({ where: { id: { in: rows.map((r) => r.entityId) } }, select: { id: true } })).map((m) => m.id));
    for (const [k, v] of mediaMap) if (v && !alive.has(v)) mediaMap.delete(k);
  }
}

function probeVideo(data: Buffer): { width: number; height: number; durationSec: number } {
  const dir = mkdtempSync(join(tmpdir(), 'sagec-video-'));
  try {
    const file = join(dir, 'v');
    writeFileSync(file, data);
    const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', file], { encoding: 'utf8' });
    const j = JSON.parse(out) as { streams?: { width?: number; height?: number }[]; format?: { duration?: string } };
    return { width: j.streams?.[0]?.width ?? 1920, height: j.streams?.[0]?.height ?? 1080, durationSec: Math.round(Number(j.format?.duration) || 0) };
  } catch {
    return { width: 1920, height: 1080, durationSec: 0 }; // ffprobe not installed: sizes are only used for layout hints
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Copies one old media file (by id) into R2 + the media library and returns the new id. */
async function media(old: unknown, fallbackAlt = ''): Promise<string | null> {
  const id = idOf(old);
  if (!id) return null;
  if (mediaMap.has(id)) return mediaMap.get(id)!;
  let doc = mediaDocs.get(id);
  try {
    doc ??= await api(`/media/${encodeURIComponent(id)}?depth=0`);
    mediaDocs.set(id, doc);
    const url = str(doc.url, 2000);
    if (!url) throw new Error('no file address');
    const alt = (str(doc.alt, 300) || fallbackAlt).slice(0, 300);
    const mime = str(doc.mimeType, 100);
    if (CHECK) {
      const head = await fetch(new URL(url, BASE), { method: 'HEAD', signal: AbortSignal.timeout(30_000) });
      if (!head.ok) throw new Error(`HTTP ${head.status}`);
      mediaMap.set(id, `check-${id}`);
      tally('photos and videos', true);
      return mediaMap.get(id)!;
    }
    const res = await fetch(new URL(url, BASE), { signal: AbortSignal.timeout(180_000) });
    if (!res.ok) throw new Error(`download failed (HTTP ${res.status})`);
    const data = Buffer.from(await res.arrayBuffer());
    const fileId = newUploadId();
    let newId: string;
    if (mime.startsWith('video/')) {
      const ext = mime === 'video/webm' ? 'webm' : mime === 'video/quicktime' ? 'mov' : 'mp4';
      const key = newUploadKey(ext, new Date(), fileId);
      await putObject(key, data, mime);
      const size = probeVideo(data);
      newId = (await prisma.mediaAsset.create({ data: { kind: 'VIDEO', objectKey: key, mimeType: mime, sizeBytes: data.length, ...size, alt } })).id;
    } else {
      const image = await processImage(data);
      const key = newUploadKey('webp', new Date(), fileId);
      await putObject(key, image.data, 'image/webp');
      const variants: { w: number; h: number; key: string }[] = [];
      for (const v of image.variants) {
        const vk = variantKeyFor(key, v.w);
        await putObject(vk, v.data, 'image/webp');
        variants.push({ w: v.w, h: v.h, key: vk });
      }
      newId = (
        await prisma.mediaAsset.create({
          data: {
            kind: 'IMAGE',
            objectKey: key,
            mimeType: 'image/webp',
            sizeBytes: image.data.length,
            width: image.width,
            height: image.height,
            variants: variants as unknown as Prisma.InputJsonValue,
            blurDataUrl: image.blurDataUrl,
            alt,
          },
        })
      ).id;
    }
    await prisma.auditLog.create({ data: { action: 'media.import', entityType: 'media', entityId: newId, meta: { payloadId: id, file: str(doc.filename, 200) } } });
    mediaMap.set(id, newId);
    tally('photos and videos', true);
    if (!alt) warn(`photo "${str(doc.filename, 200) || id}" has no description: add one in Media library`);
    return newId;
  } catch (error) {
    warn(`photo/video ${str(doc?.filename, 200) || id} not copied: ${(error as Error).message}`);
    mediaMap.set(id, null);
    return null;
  }
}

// ───────────── Content ─────────────

const live = (v: unknown) => (v === 'draft' ? 'DRAFT' : 'PUBLISHED') as 'DRAFT' | 'PUBLISHED';

async function importSettings() {
  console.log('Company details → Site settings');
  const c = await global('company-info');
  if (!Object.keys(c).length) return;
  // "KG 7 Ave, Kigali, Rwanda" → street "KG 7 Ave", city "Kigali", country "Rwanda"
  const parts = str(c.address, 300).split(',').map((x) => x.trim()).filter(Boolean);
  const country = parts.length >= 2 ? parts.pop()! : '';
  const city = parts.length >= 2 || (parts.length === 1 && country) ? parts.pop()! : '';
  const data = {
    ...(str(c.tagline) && { tagline: str(c.tagline, 500) }),
    ...(str(c.phone) && { phone: str(c.phone, 40) }),
    ...(str(c.email) && { publicEmail: str(c.email, 200) }),
    ...(str(c.address) && { addressStreet: parts.join(', '), addressCity: city, addressCountry: country }),
    ...(str(c.whatsappNumber) && { whatsappNumber: str(c.whatsappNumber, 30).replace(/\D/g, '') }),
    ...(str(c.whatsappLabel) && { whatsappLabel: str(c.whatsappLabel, 80) }),
    ...(str(c.responseNote) && { responseNote: str(c.responseNote, 300) }),
    ...(arr(c.businessHours).length && { businessHours: arr(c.businessHours).map((h) => ({ day: str(obj(h).day, 60), hours: str(obj(h).hours, 60) })) }),
    ...(arr(c.socials).length && { socials: arr(c.socials).map((s) => ({ platform: str(obj(s).iconKey, 30), url: str(obj(s).href, 500) })).filter((s) => s.platform && s.url) }),
  };
  if (await prisma.auditLog.findFirst({ where: { action: 'settings.import' }, select: { id: true } })) {
    console.log('  already copied by an earlier run, left as it is (edit them in CMS → Site settings)');
    return tally('site settings', false);
  }
  if (CHECK) return void console.log(`  would update: ${Object.keys(data).join(', ') || 'nothing'}`);
  const exists = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { id: true } });
  if (!exists) throw new Error('Site settings are missing: run the seed first (npm run db:seed).');
  await prisma.siteSettings.update({ where: { id: 1 }, data });
  await prisma.auditLog.create({ data: { action: 'settings.import', entityType: 'settings', entityId: '1' } });
  tally('site settings', true);
}

async function importPages() {
  console.log('Page texts and photos');
  for (const slug of PAGE_SLUGS) {
    const raw = await global(slug);
    if (!Object.keys(raw).length) continue;
    const key = `page:${slug}`;
    const row = await prisma.globalSection.findUnique({ where: { key } });
    if (row?.publishedAt && !OVERWRITE_PAGES) {
      console.log(`  ${slug}: already edited in the new CMS, left as it is (--pages to overwrite)`);
      tally('pages', false);
      continue;
    }
    // Swap every old photo id for the copied one.
    const doc = structuredClone(raw);
    const swap = async (node: unknown, path: string[]): Promise<void> => {
      if (Array.isArray(node)) {
        for (const n of node) await swap(n, path);
        return;
      }
      if (!node || typeof node !== 'object') return;
      const o = node as Doc;
      const [head, ...rest] = path;
      if (!rest.length) o[head] = await media(o[head], str(o.alt, 300) || str(o.headline, 300));
      else await swap(o[head], rest);
    };
    for (const p of mediaFieldPaths(slug as PageSlug)) await swap(doc, p);
    const parsed = parsePage(slug as PageSlug, doc) as Prisma.InputJsonValue;
    if (CHECK) {
      tally('pages', true);
      continue;
    }
    await prisma.$transaction([
      prisma.globalSection.upsert({ where: { key }, update: { draft: parsed, published: parsed, publishedAt: new Date() }, create: { key, draft: parsed, published: parsed, publishedAt: new Date() } }),
      prisma.contentVersion.create({ data: { entityType: 'global', entityKey: key, snapshot: parsed, note: 'Imported from the old CMS' } }),
    ]);
    tally('pages', true);
  }
}

const serviceIds = new Map<string, string>(); // old id → new id

async function importServices() {
  console.log('Services');
  const icons: string[] = SERVICE_ICONS.map((i) => i.key);
  for (const s of await all('services')) {
    const slug = slugify(str(s.slug) || str(s.title));
    const existing = await prisma.service.findUnique({ where: { slug }, select: { id: true } });
    if (existing) {
      serviceIds.set(String(s.id), existing.id);
      tally('services', false);
      continue;
    }
    const title = str(s.title, 160);
    const data = {
      slug,
      title,
      status: live(s._status),
      shortDescription: str(s.description, 600),
      icon: icons.includes(str(s.iconKey)) ? str(s.iconKey) : '',
      deliverables: arr(s.deliverables).map((d) => str(obj(d).text, 200)).filter(Boolean),
      coverMediaId: await media(s.image, title),
      detailMediaId: await media(s.detailImage, title),
      sortOrder: Number(s.order) || 0,
    };
    if (CHECK) {
      tally('services', true);
      continue;
    }
    const row = await prisma.service.create({ data: { ...data, createdAt: new Date(str(s.createdAt) || Date.now()) } });
    serviceIds.set(String(s.id), row.id);
    tally('services', true);
  }
}

async function importProjects() {
  console.log('Projects');
  const categories = PROJECT_CATEGORIES as readonly string[];
  for (const p of await all('projects')) {
    const slug = slugify(str(p.slug) || str(p.title));
    if (await prisma.project.findUnique({ where: { slug }, select: { id: true } })) {
      tally('projects', false);
      continue;
    }
    const title = str(p.title, 160);
    const gallery: string[] = [];
    for (const g of arr(p.gallery)) {
      const m = await media(obj(g).image, `${title} — photo ${gallery.length + 1}`);
      if (m && !gallery.includes(m)) gallery.push(m);
    }
    const inProgress = str(p.status) === 'In Progress';
    const data = {
      slug,
      title,
      status: live(p._status),
      category: categories.includes(str(p.category)) ? str(p.category) : (str(p.category, 60) || 'Commercial'),
      state: (inProgress ? 'IN_PROGRESS' : 'COMPLETED') as 'IN_PROGRESS' | 'COMPLETED',
      progress: inProgress ? 50 : 100,
      year: str(p.year, 20),
      location: str(p.location, 120),
      client: str(p.client, 120),
      area: str(p.area, 60),
      shortDescription: str(p.shortDescription, 600),
      paragraphs: str(p.description, 20000).split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean),
      featured: p.featured === true,
      sortOrder: Number(p.order) || 0,
      coverMediaId: await media(p.coverImage, title),
      featuredMediaId: await media(p.featuredImage, title),
    };
    if (CHECK) {
      tally('projects', true);
      continue;
    }
    const services = arr(p.services).map(idOf).map((id) => (id ? serviceIds.get(id) : undefined)).filter((v): v is string => !!v);
    await prisma.project.create({
      data: {
        ...data,
        createdAt: new Date(str(p.createdAt) || Date.now()),
        gallery: { create: gallery.map((mediaId, position) => ({ mediaId, position })) },
        services: { create: [...new Set(services)].map((serviceId) => ({ serviceId })) },
      },
    });
    tally('projects', true);
  }
  // The site shows one featured project; keep only the first if the old CMS had several.
  if (!CHECK) {
    const featured = await prisma.project.findMany({ where: { featured: true, deletedAt: null }, orderBy: { sortOrder: 'asc' }, select: { id: true } });
    if (featured.length > 1) await prisma.project.updateMany({ where: { id: { in: featured.slice(1).map((f) => f.id) } }, data: { featured: false } });
  }
}

async function importSimple() {
  console.log('Testimonials, partners, job openings');
  for (const t of await all('testimonials')) {
    const name = str(t.name, 120);
    if (!name || (await prisma.testimonial.findFirst({ where: { name, quote: str(t.quote, 2000) }, select: { id: true } }))) {
      tally('testimonials', false);
      continue;
    }
    const avatarMediaId = await media(t.avatar, name);
    if (!CHECK) await prisma.testimonial.create({ data: { name, role: str(t.role, 160), quote: str(t.quote, 2000), avatarMediaId, status: 'PUBLISHED', sortOrder: Number(t.order) || 0, createdAt: new Date(str(t.createdAt) || Date.now()) } });
    tally('testimonials', true);
  }
  for (const p of await all('partners')) {
    const name = str(p.name, 120);
    if (!name || (await prisma.partner.findFirst({ where: { name }, select: { id: true } }))) {
      tally('partners', false);
      continue;
    }
    const logoMediaId = await media(p.logo, `${name} logo`);
    if (!CHECK) await prisma.partner.create({ data: { name, website: str(p.website, 300), logoMediaId, status: 'PUBLISHED', sortOrder: Number(p.order) || 0, createdAt: new Date(str(p.createdAt) || Date.now()) } });
    tally('partners', true);
  }
  const departments = JOB_DEPARTMENTS as readonly string[];
  for (const j of await all('jobs')) {
    const title = str(j.title, 160);
    if (!title || (await prisma.job.findFirst({ where: { title, location: str(j.location, 120) || 'Kigali, Rwanda' }, select: { id: true } }))) {
      tally('job openings', false);
      continue;
    }
    if (!CHECK)
      await prisma.job.create({
        data: {
          title,
          department: departments.includes(str(j.department)) ? str(j.department) : '',
          type: str(j.type, 40) || 'Full-time',
          location: str(j.location, 120) || 'Kigali, Rwanda',
          description: str(j.description, 5000),
          requirements: arr(j.requirements).map((r) => str(obj(r).requirement, 300)).filter(Boolean),
          applyEmail: str(j.applyEmail, 200),
          applyLink: str(j.applyLink, 500),
          status: str(j.status) === 'closed' ? 'DRAFT' : 'PUBLISHED',
          sortOrder: Number(j.order) || 0,
          createdAt: new Date(str(j.createdAt) || Date.now()),
        },
      });
    tally('job openings', true);
  }
}

// Old blog content blocks → the new editor's document.
const textNodes = (text: string): DocNode[] =>
  text.split('\n').flatMap((line, i) => [...(i ? [{ type: 'hardBreak' }] : []), ...(line ? [{ type: 'text', text: line }] : [])]);
const para = (text: string): DocNode => ({ type: 'paragraph', content: textNodes(text) });

async function blocksToDoc(blocks: unknown[], title: string): Promise<DocNode> {
  const content: DocNode[] = [];
  const image = async (old: unknown, caption = '') => {
    const id = await media(old, caption || title);
    if (id) content.push({ type: 'image', attrs: { mediaId: id, alt: '', title: caption } });
  };
  for (const raw of blocks) {
    const b = obj(raw);
    switch (b.blockType) {
      case 'paragraph':
        if (str(b.text)) content.push(para(str(b.text, 20000)));
        break;
      case 'heading':
        if (str(b.text)) content.push({ type: 'heading', attrs: { level: 2 }, content: textNodes(str(b.text, 300)) });
        break;
      case 'image':
        await image(b.image, str(b.caption, 300));
        break;
      case 'checklist':
        content.push({ type: 'bulletList', content: arr(b.items).map((it) => ({ type: 'listItem', content: [para(str(obj(it).text, 1000))] })) });
        break;
      case 'quote':
        content.push({ type: 'blockquote', content: [para(str(b.text, 5000)), ...(str(b.author) ? [para(`— ${str(b.author, 200)}`)] : [])] });
        break;
      case 'gallery':
        for (const g of arr(b.images)) await image(obj(g).image);
        break;
      default:
        if (b.blockType) warn(`article "${title}": unknown block "${String(b.blockType)}" left out`);
    }
  }
  return { type: 'doc', content };
}

async function mediaInfo(ids: string[]): Promise<Map<string, MediaInfo>> {
  const map = new Map<string, MediaInfo>();
  const rows = ids.length ? await prisma.mediaAsset.findMany({ where: { id: { in: ids }, kind: 'IMAGE' } }) : [];
  for (const m of rows) map.set(m.id, { src: mediaUrl(m.objectKey), srcset: buildSrcSet(m.objectKey, m.width, parseVariants(m.variants)), width: m.width, height: m.height, alt: m.alt });
  return map;
}

async function importBlog() {
  console.log('Blog');
  const authorIds = new Map<string, string>();
  for (const a of await all('blog-authors')) {
    const name = str(a.name, 120);
    const found = await prisma.blogAuthor.findFirst({ where: { name }, select: { id: true } });
    if (found) {
      authorIds.set(String(a.id), found.id);
      tally('blog authors', false);
      continue;
    }
    const avatarMediaId = await media(a.avatar, name);
    if (!CHECK) {
      const row = await prisma.blogAuthor.create({
        data: { name, role: str(a.role, 120), bio: str(a.bio, 1000), avatarMediaId, socials: arr(a.socials).map((s) => ({ platform: str(obj(s).iconKey, 30), url: str(obj(s).href, 500) })).filter((s) => s.platform && s.url) },
      });
      authorIds.set(String(a.id), row.id);
    }
    tally('blog authors', true);
  }
  const tags = new Map((await all('tags')).map((t) => [String(t.id), str(t.name, 60)]));
  const categoryId = async (name: string): Promise<string> => {
    const label = name || 'News';
    const slug = slugify(label);
    const found = await prisma.blogCategory.findUnique({ where: { slug }, select: { id: true } });
    if (found) return found.id;
    if (CHECK) return 'check';
    const max = await prisma.blogCategory.aggregate({ _max: { sortOrder: true } });
    tally('blog categories', true);
    return (await prisma.blogCategory.create({ data: { name: label, slug, sortOrder: (max._max.sortOrder ?? 0) + 10 } })).id;
  };
  const postIds = new Map<string, string>();
  for (const p of await all('blog-posts')) {
    const title = str(p.title, 160);
    const slug = slugify(str(p.slug) || title);
    const found = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (found) {
      postIds.set(String(p.id), found.id);
      tally('articles', false);
      continue;
    }
    const doc = await blocksToDoc(arr(p.content), title);
    const coverMediaId = await media(p.coverImage, title);
    if (CHECK) {
      postIds.set(String(p.id), 'check');
      tally('articles', true);
      continue;
    }
    const ids = doc.content!.filter((n) => n.type === 'image').map((n) => String(n.attrs!.mediaId));
    const rendered = renderDoc(doc, await mediaInfo(ids));
    const row = await prisma.post.create({
      data: {
        slug,
        title,
        status: live(p._status),
        excerpt: str(p.excerpt, 500),
        doc: doc as unknown as Prisma.InputJsonValue,
        html: rendered.html,
        toc: rendered.toc,
        fonts: rendered.fonts,
        readingMinutes: rendered.readingMinutes,
        categoryId: await categoryId(str(p.category, 60)),
        authorId: authorIds.get(idOf(p.author) ?? '') ?? null,
        coverMediaId,
        tags: arr(p.tags).map((t) => tags.get(idOf(t) ?? '') ?? '').filter(Boolean),
        publishedAt: new Date(str(p.publishedAt) || str(p.createdAt) || Date.now()),
        createdAt: new Date(str(p.createdAt) || Date.now()),
      },
    });
    postIds.set(String(p.id), row.id);
    tally('articles', true);
  }
  for (const c of await all('blog-comments', true)) {
    const postId = postIds.get(idOf(c.post) ?? '');
    const createdAt = new Date(str(c.createdAt) || Date.now());
    if (!postId || (postId !== 'check' && await prisma.blogComment.findFirst({ where: { postId, name: str(c.name, 120), createdAt }, select: { id: true } }))) {
      tally('comments', false);
      continue;
    }
    if (!CHECK)
      await prisma.blogComment.create({
        data: { postId, name: str(c.name, 120) || 'Visitor', email: str(c.email, 200), website: str(c.website, 300), text: str(c.text, 3000), approved: c.approved === true, createdAt },
      });
    tally('comments', true);
  }
}

async function importMessages() {
  if (!token) return;
  console.log('Contact messages');
  for (const m of await all('contact-submissions', true)) {
    const createdAt = new Date(str(m.createdAt) || Date.now());
    const email = str(m.email, 200).toLowerCase();
    if (await prisma.lead.findFirst({ where: { email, createdAt }, select: { id: true } })) {
      tally('contact messages', false);
      continue;
    }
    if (!CHECK)
      await prisma.lead.create({
        data: {
          // "read" and "replied" in the old CMS → Contacted; nothing is emailed again
          status: str(m.status) === 'new' || !m.status ? 'NEW' : 'CONTACTED',
          name: str(m.name, 200),
          email,
          phone: str(m.phone, 50),
          category: str(m.category) === 'company' ? 'company' : 'personal',
          organisation: str(m.organisation, 200),
          subject: str(m.subject, 300),
          message: str(m.message, 5000),
          source: 'Old website',
          notifiedAt: createdAt,
          createdAt,
        },
      });
    tally('contact messages', true);
  }
}

async function main() {
  console.log(`${CHECK ? 'Checking' : 'Copying'} content from ${BASE}${CHECK ? ' (nothing is changed)' : ''}\n`);
  await login();
  await loadPreviousMedia();
  await importSettings();
  await importPages();
  await importServices();
  await importProjects();
  await importSimple();
  await importBlog();
  await importMessages();
  console.log('\nSummary');
  for (const [what, c] of Object.entries(counts)) console.log(`  ${what}: ${c.added} ${CHECK ? 'to copy' : 'copied'}${c.skipped ? `, ${c.skipped} already there` : ''}`);
  if (warnings.length) console.log(`\n${warnings.length} note(s) above (marked !) to look at.`);
  if (!CHECK) console.log('\nDone. Open the website and CMS → Media library to look things over.');
}

main()
  .catch((error) => {
    console.error(`\nStopped: ${(error as Error).message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
