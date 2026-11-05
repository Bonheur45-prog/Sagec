import { isValidSlug, slugify } from './slug';
import type { Errors, Input, Validation } from './settings-validation';

// Pure validation of the collection editors (services, projects, testimonials, partners, job openings).
// English only. Lists (deliverables, paragraphs, requirements…) are typed one item per line.
// Tested in phase3.test.ts.

const ID = /^[a-z0-9]{10,40}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Icons available for services (the same set the current site draws). */
export const SERVICE_ICONS = [
  { key: 'architecture', label: 'Architecture (compass)' },
  { key: 'structure', label: 'Structure (building)' },
  { key: 'mep', label: 'MEP (wrench)' },
  { key: 'management', label: 'Management (clipboard)' },
  { key: 'construction', label: 'Construction (hard hat)' },
  { key: 'interior', label: 'Interior (sofa)' },
] as const;

/** Project categories, also the filter buttons on the Projects page. */
export const PROJECT_CATEGORIES = ['Commercial', 'Residential', 'Interior Design', 'Infrastructure', 'Institutional/Civic'] as const;

export const JOB_DEPARTMENTS = ['Architecture', 'Engineering', 'Project Management', 'Interior Design', 'Administration'] as const;
export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;

/** Text box with one item per line → list (empty lines dropped). */
export const lines = (raw: string, maxItems = 20, maxLen = 300) =>
  raw
    .split(/\r?\n/)
    .map((l) => l.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);

type Status = 'DRAFT' | 'PUBLISHED';

function helpers(input: Input, errors: Errors) {
  const text = (name: string, label: string, max: number, required = false) => {
    const v = input.get(name).trim();
    if (required && !v) errors[name] = `${label} is required.`;
    else if (v.length > max) errors[name] = `${label} can be at most ${max} characters.`;
    return v;
  };
  const media = (name: string) => {
    const v = input.get(name).trim();
    return ID.test(v) ? v : null;
  };
  const int = (name: string, min: number, max: number, fallback: number) => {
    const n = Number.parseInt(input.get(name), 10);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  const url = (name: string, label: string) => {
    const v = input.get(name).trim();
    if (!v) return '';
    try {
      const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString();
    } catch {
      /* fall through */
    }
    errors[name] = `${label}: use a full web address (https://…).`;
    return v;
  };
  const slug = (name: string, fallbackFrom: string) => {
    const raw = input.get(name).trim().toLowerCase();
    const v = raw || slugify(fallbackFrom);
    if (!isValidSlug(v)) errors[name] = 'Use lowercase letters, numbers and dashes, e.g. silverback-mall.';
    return v;
  };
  const status = (): Status => (input.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
  /** A value that must be one of `options` (empty allowed unless required). */
  const choice = <T extends string>(name: string, label: string, options: readonly T[], required: boolean) => {
    const v = input.get(name).trim();
    if (!v) {
      if (required) errors[name] = `Choose a ${label.toLowerCase()}.`;
      return '';
    }
    if (!(options as readonly string[]).includes(v)) {
      errors[name] = `Choose one of the listed ${label.toLowerCase()}s.`;
      return '';
    }
    return v as T;
  };
  return { text, media, int, url, slug, status, choice };
}

const result = <T,>(errors: Errors, data: T): Validation<T> => (Object.keys(errors).length ? { ok: false, errors } : { ok: true, data });

// ── Services ──
export type ServiceData = {
  slug: string;
  status: Status;
  title: string;
  shortDescription: string;
  icon: string;
  deliverables: string[];
  coverMediaId: string | null;
  detailMediaId: string | null;
  showOnHome: boolean;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
};

export function validateService(input: Input): Validation<ServiceData> {
  const errors: Errors = {};
  const h = helpers(input, errors);
  const title = h.text('title', 'Name', 120, true);
  const data: ServiceData = {
    slug: h.slug('slug', title),
    status: h.status(),
    title,
    shortDescription: h.text('shortDescription', 'Short description', 400),
    icon: h.choice('icon', 'Icon', SERVICE_ICONS.map((i) => i.key), false),
    deliverables: lines(input.get('deliverables'), 12, 160),
    coverMediaId: h.media('coverMediaId'),
    detailMediaId: h.media('detailMediaId'),
    showOnHome: input.get('showOnHome') === 'on',
    sortOrder: h.int('sortOrder', 0, 9999, 0),
    metaTitle: h.text('metaTitle', 'Search title', 120),
    metaDescription: h.text('metaDescription', 'Search description', 300),
  };
  if (data.status === 'PUBLISHED') {
    if (!data.shortDescription) errors.shortDescription = 'Add a short description before publishing.';
    if (!data.coverMediaId) errors.coverMediaId = 'Add a card photo before publishing.';
  }
  return result(errors, data);
}

// ── Projects ──
export type ProjectData = {
  slug: string;
  status: Status;
  title: string;
  category: string;
  state: 'COMPLETED' | 'IN_PROGRESS';
  progress: number;
  year: string;
  location: string;
  client: string;
  area: string;
  shortDescription: string;
  paragraphs: string[];
  highlights: string[];
  featured: boolean;
  showOnHome: boolean;
  sortOrder: number;
  coverMediaId: string | null;
  featuredMediaId: string | null;
  metaTitle: string;
  metaDescription: string;
  gallery: string[];
  serviceIds: string[];
};

export function validateProject(input: Input): Validation<ProjectData> {
  const errors: Errors = {};
  const h = helpers(input, errors);
  const title = h.text('title', 'Name', 120, true);
  const state = input.get('state') === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'COMPLETED';
  const data: ProjectData = {
    slug: h.slug('slug', title),
    status: h.status(),
    title,
    category: h.choice('category', 'Category', PROJECT_CATEGORIES, false),
    state,
    progress: state === 'COMPLETED' ? 100 : h.int('progress', 0, 99, 0),
    year: h.text('year', 'Year', 20),
    location: h.text('location', 'Location', 120),
    client: h.text('client', 'Client', 120),
    area: h.text('area', 'Area', 60),
    shortDescription: h.text('shortDescription', 'Short description', 400),
    paragraphs: lines(input.get('paragraphs'), 20, 3000),
    highlights: lines(input.get('highlights'), 12, 160),
    featured: input.get('featured') === 'on',
    showOnHome: input.get('showOnHome') === 'on',
    sortOrder: h.int('sortOrder', 0, 9999, 0),
    coverMediaId: h.media('coverMediaId'),
    featuredMediaId: h.media('featuredMediaId'),
    metaTitle: h.text('metaTitle', 'Search title', 120),
    metaDescription: h.text('metaDescription', 'Search description', 300),
    gallery: [...new Set(input.getAll('gallery').filter((v) => ID.test(v)))].slice(0, 40),
    serviceIds: [...new Set(input.getAll('serviceIds').filter((v) => ID.test(v)))],
  };
  if (data.status === 'PUBLISHED') {
    if (!data.shortDescription) errors.shortDescription = 'Add a short description before publishing.';
    if (!data.category) errors.category = 'Choose a category before publishing.';
    if (!data.coverMediaId) errors.coverMediaId = 'Add a cover photo before publishing.';
  }
  return result(errors, data);
}

// ── Testimonials ──
export type TestimonialData = { name: string; role: string; quote: string; avatarMediaId: string | null; status: Status; showOnHome: boolean; sortOrder: number };

export function validateTestimonial(input: Input): Validation<TestimonialData> {
  const errors: Errors = {};
  const h = helpers(input, errors);
  const data: TestimonialData = {
    name: h.text('name', 'Name', 120, true),
    role: h.text('role', 'Role and company', 160),
    quote: h.text('quote', 'Quote', 1200),
    avatarMediaId: h.media('avatarMediaId'),
    status: h.status(),
    showOnHome: input.get('showOnHome') === 'on',
    sortOrder: h.int('sortOrder', 0, 9999, 0),
  };
  if (data.status === 'PUBLISHED' && !data.quote) errors.quote = 'Add the quote before publishing.';
  return result(errors, data);
}

// ── Partners ──
export type PartnerData = { name: string; website: string; logoMediaId: string | null; status: Status; sortOrder: number };

export function validatePartner(input: Input): Validation<PartnerData> {
  const errors: Errors = {};
  const h = helpers(input, errors);
  const data: PartnerData = {
    name: h.text('name', 'Name', 120, true),
    website: h.url('website', 'Website'),
    logoMediaId: h.media('logoMediaId'),
    status: h.status(),
    sortOrder: h.int('sortOrder', 0, 9999, 0),
  };
  if (data.status === 'PUBLISHED' && !data.logoMediaId) errors.logoMediaId = 'Add the logo before publishing.';
  return result(errors, data);
}

// ── Job openings ──
export type JobData = {
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
  applyEmail: string;
  applyLink: string;
  status: Status;
  sortOrder: number;
};

export function validateJob(input: Input): Validation<JobData> {
  const errors: Errors = {};
  const h = helpers(input, errors);
  const applyEmail = input.get('applyEmail').trim().toLowerCase();
  if (applyEmail && !EMAIL.test(applyEmail)) errors.applyEmail = 'Use a valid email address.';
  const data: JobData = {
    title: h.text('title', 'Job title', 150, true),
    department: h.choice('department', 'Department', JOB_DEPARTMENTS, false),
    type: h.choice('type', 'Job type', JOB_TYPES, false) || 'Full-time',
    location: h.text('location', 'Location', 120, true),
    description: h.text('description', 'About the role', 5000),
    requirements: lines(input.get('requirements'), 20, 300),
    applyEmail,
    applyLink: h.url('applyLink', 'Apply online link'),
    status: h.status(),
    sortOrder: h.int('sortOrder', 0, 9999, 0),
  };
  if (data.status === 'PUBLISHED') {
    if (!data.department) errors.department = 'Choose a department before opening the job.';
    if (!data.description) errors.description = 'Describe the role before opening the job.';
  }
  return result(errors, data);
}
