import { isValidSlug, slugify } from '@/lib/cms/slug';
import type { Errors } from '@/lib/cms/settings-validation';
import type { Rendered } from './render';

// Blog post editor payload: validation and the SEO assistant. Pure (tested in blog.test.ts).

export type PostPayload = {
  title: string;
  excerpt: string;
  /** The editor's document (Tiptap JSON). */
  doc: unknown;
  metaTitle: string;
  metaDescription: string;
  ogMediaId: string | null;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  categoryId: string;
  authorId: string | null;
  coverMediaId: string | null;
  tags: string[];
  featured: boolean;
  /** ISO date; in the future = scheduled. Empty = now, on first publish. */
  publishedAt: string | null;
  focusKeyword: string;
  canonicalUrl: string;
  noIndex: boolean;
};

const ID = /^[a-z0-9]{10,40}$/;
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const MAX_DOC_BYTES = 400_000;

export const isEmptyDoc = (doc: unknown) => {
  const c = obj(doc).content;
  return !Array.isArray(c) || c.length === 0 || (c.length === 1 && !obj(c[0]).content);
};

export function validatePost(raw: unknown): { ok: true; data: PostPayload } | { ok: false; errors: Errors } {
  const o = obj(raw);
  const errors: Errors = {};
  const title = str(o.title, 160);
  const excerpt = str(o.excerpt, 400);
  const doc = o.doc && typeof o.doc === 'object' ? o.doc : { type: 'doc', content: [] };
  if (!title) errors.title = 'Add a title.';
  if (JSON.stringify(doc).length > MAX_DOC_BYTES) errors.doc = 'This article is too long to save. Split it into two articles.';

  const status = o.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
  const slug = str(o.slug, 80).toLowerCase() || slugify(title);
  if (!isValidSlug(slug)) errors.slug = 'Use lowercase letters, numbers and dashes.';
  const categoryId = str(o.categoryId, 40);
  if (!ID.test(categoryId)) errors.categoryId = 'Choose a category.';
  const tags = [...new Set((Array.isArray(o.tags) ? o.tags : []).map((t) => str(t, 30)).filter(Boolean))].slice(0, 10);
  let publishedAt: string | null = null;
  if (typeof o.publishedAt === 'string' && o.publishedAt) {
    const d = new Date(o.publishedAt);
    if (Number.isNaN(d.getTime())) errors.publishedAt = 'Use a valid date.';
    else publishedAt = d.toISOString();
  }
  const canonicalUrl = str(o.canonicalUrl, 500);
  if (canonicalUrl && !/^https:\/\/[^\s]+$/.test(canonicalUrl)) errors.canonicalUrl = 'Use a full https:// address, or leave empty.';
  if (status === 'PUBLISHED') {
    if (!excerpt) errors.excerpt = 'Add a short summary before publishing.';
    if (isEmptyDoc(doc)) errors.doc = 'Write the article before publishing.';
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      title,
      excerpt,
      doc,
      metaTitle: str(o.metaTitle, 120),
      metaDescription: str(o.metaDescription, 300),
      ogMediaId: typeof o.ogMediaId === 'string' && ID.test(o.ogMediaId) ? o.ogMediaId : null,
      slug,
      status,
      categoryId,
      authorId: typeof o.authorId === 'string' && ID.test(o.authorId) ? o.authorId : null,
      coverMediaId: typeof o.coverMediaId === 'string' && ID.test(o.coverMediaId) ? o.coverMediaId : null,
      tags,
      featured: o.featured === true,
      publishedAt,
      focusKeyword: str(o.focusKeyword, 80),
      canonicalUrl,
      noIndex: o.noIndex === true,
    },
  };
}

export type Check = { ok: boolean; text: string };

/** The SEO assistant: advice shown live in the editor (never blocks saving). */
export function seoChecks(input: { title: string; slug: string; excerpt: string; metaTitle: string; metaDescription: string; focusKeyword: string; rendered: Pick<Rendered, 'words' | 'text' | 'headings' | 'links'>; hasCover: boolean; missingAlt: number }): Check[] {
  const kw = input.focusKeyword.trim().toLowerCase();
  const title = input.metaTitle || input.title;
  const desc = input.metaDescription || input.excerpt;
  const firstPara = input.rendered.text.split(/(?<=[.!?])\s/).slice(0, 3).join(' ').toLowerCase();
  const kwSlug = kw.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const internal = input.rendered.links.filter((l) => l.startsWith('/')).length;
  const checks: Check[] = [
    { ok: title.length >= 30 && title.length <= 60, text: `Search title is ${title.length} characters (aim for 30–60).` },
    { ok: desc.length >= 120 && desc.length <= 160, text: `Search description is ${desc.length} characters (aim for 120–160).` },
    { ok: input.rendered.words >= 300, text: `${input.rendered.words} words (aim for at least 300).` },
    { ok: input.rendered.headings >= 2, text: input.rendered.headings >= 2 ? 'Uses sub-headings.' : 'Add sub-headings (H2) to break up the text.' },
    { ok: internal > 0, text: internal ? `${internal} link(s) to other pages of the site.` : 'Link to at least one other page of the site (a service, a project…).' },
    { ok: input.hasCover, text: input.hasCover ? 'Has a cover photo.' : 'Add a cover photo: it is shown in lists and when shared.' },
    { ok: input.missingAlt === 0, text: input.missingAlt ? `${input.missingAlt} photo(s) without a description.` : 'All photos have descriptions.' },
  ];
  if (!kw) checks.unshift({ ok: false, text: 'Set a focus keyword: the words people would type into Google to find this article.' });
  else
    checks.unshift(
      { ok: title.toLowerCase().includes(kw), text: `Focus keyword ${title.toLowerCase().includes(kw) ? 'is' : 'is not'} in the search title.` },
      { ok: desc.toLowerCase().includes(kw), text: `Focus keyword ${desc.toLowerCase().includes(kw) ? 'is' : 'is not'} in the description.` },
      { ok: firstPara.includes(kw), text: `Focus keyword ${firstPara.includes(kw) ? 'appears' : 'does not appear'} at the start of the article.` },
      { ok: !!kwSlug && input.slug.includes(kwSlug), text: `Focus keyword ${kwSlug && input.slug.includes(kwSlug) ? 'is' : 'is not'} in the address.` },
    );
  return checks;
}
