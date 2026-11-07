// The editable texts and photos of each website page. The field lists (schemas.json) were generated from
// the old Payload page settings (once, before the old CMS was removed), so content imported from the old CMS fits
// as it is and the site's sections read the same names. Pure: no database here (tested in pages.test.ts).

import rawSchemas from './schemas.json';
import starter from './starter.json';
import type { Problems } from '@/lib/cms/globals-model';

import { flatFields, parseFields, type Field, type PageSchema } from './fields';

export * from './fields';

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

export const PAGE_SLUGS = ['home-page', 'about-page', 'services-page', 'projects-page', 'testimonials-page', 'careers-page', 'blog-page', 'contact-page', 'seo-settings'] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];
export const isPageSlug = (v: unknown): v is PageSlug => typeof v === 'string' && (PAGE_SLUGS as readonly string[]).includes(v);

/** Names in the CMS menu, with the address of the page on the website. */
export const PAGE_INFO: Record<PageSlug, { title: string; url: string | null; blurb: string }> = {
  'home-page': { title: 'Home', url: '/', blurb: 'Hero slides, numbers, section headings and the closing call to action.' },
  'about-page': { title: 'About', url: '/about', blurb: 'Story, mission and vision, values and the timeline.' },
  'services-page': { title: 'Services', url: '/services', blurb: 'Hero, how we work, why choose us and the call to action.' },
  'projects-page': { title: 'Projects', url: '/projects', blurb: 'Hero, numbers strip and the project page labels.' },
  'testimonials-page': { title: 'Testimonials', url: '/testimonials', blurb: 'The heading over the client reviews.' },
  'careers-page': { title: 'Careers', url: '/careers', blurb: 'Hero, how to apply and the “no openings” message.' },
  'blog-page': { title: 'Blog', url: '/blog', blurb: 'Blog hero and the labels around the articles.' },
  'contact-page': { title: 'Contact', url: '/contact', blurb: 'Hero, contact details section, form texts and the map.' },
  'seo-settings': { title: 'Search & sharing', url: null, blurb: 'Title and description per page for Google and link previews.' },
};

const schemas = rawSchemas as unknown as PageSchema[];
export function pageSchema(slug: PageSlug): PageSchema {
  const s = schemas.find((x) => x.slug === slug);
  if (!s) throw new Error(`No field list for ${slug}`);
  return s;
}

export const starterPage = (slug: PageSlug): Record<string, unknown> => ((starter as Record<string, unknown>)[slug] as Record<string, unknown>) ?? {};

/** Anything (saved JSON, editor input, an old Payload document) → that page's texts, nothing else. Empty → SAGEC's starter text. */
export function parsePage(slug: PageSlug, raw: unknown): Record<string, unknown> {
  const o = obj(raw);
  return parseFields(pageSchema(slug).fields, Object.keys(o).length ? o : starterPage(slug));
}

/** Required texts left empty, and lists outside their allowed length. Keys are dotted paths ("hero.slides.0.headline"). */
export function pageProblems(slug: PageSlug, doc: Record<string, unknown>): Problems {
  const p: Problems = {};
  const walk = (fields: Field[], o: Record<string, unknown>, prefix: string) => {
    for (const f of flatFields(fields)) {
      if (!f.name) continue;
      const key = prefix + f.name;
      const v = o[f.name];
      if (f.type === 'group') walk(f.fields ?? [], obj(v), `${key}.`);
      else if (f.type === 'array') {
        const rows = Array.isArray(v) ? v : [];
        if (f.minRows && rows.length < f.minRows) p[key] = `Add at least ${f.minRows}.`;
        if (f.maxRows && rows.length > f.maxRows) p[key] = `At most ${f.maxRows}.`;
        rows.forEach((row, i) => walk(f.fields ?? [], obj(row), `${key}.${i}.`));
      } else if (f.required && (f.type === 'text' || f.type === 'textarea' || f.type === 'email' || f.type === 'select') && !(typeof v === 'string' && v.trim())) {
        p[key] = 'This is needed on the website.';
      } else if (f.type === 'email' && typeof v === 'string' && v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) {
        p[key] = 'Use a valid email address.';
      }
    }
  };
  walk(pageSchema(slug).fields, doc, '');
  return p;
}

/** Where a page keeps photos/videos: paths through groups and lists (lists are walked item by item). */
export function mediaFieldPaths(slug: PageSlug): string[][] {
  const out: string[][] = [];
  const walk = (fields: Field[], path: string[]) => {
    for (const f of flatFields(fields)) {
      if (!f.name) continue;
      if (f.type === 'upload') out.push([...path, f.name]);
      else if (f.type === 'group' || f.type === 'array') walk(f.fields ?? [], [...path, f.name]);
    }
  };
  walk(pageSchema(slug).fields, []);
  return out;
}

