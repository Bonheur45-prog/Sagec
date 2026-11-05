import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JOB_DEPARTMENTS, PROJECT_CATEGORIES, lines, validateJob, validatePartner, validateProject, validateService, validateTestimonial } from './collections-validation';
import type { Input } from './settings-validation';
import { isValidSlug, slugify, uniqueSlug } from './slug';

const input = (values: Record<string, string | string[]>): Input => ({
  get: (n) => (Array.isArray(values[n]) ? (values[n] as string[])[0] : (values[n] as string)) ?? '',
  getAll: (n) => (Array.isArray(values[n]) ? (values[n] as string[]) : values[n] ? [values[n] as string] : []),
});
const MEDIA = 'cm0abcdefghij123';

test('slugs: made from names, valid only as lowercase-dash, and made unique', async () => {
  assert.equal(slugify('Silverback Mall — Phase 2!'), 'silverback-mall-phase-2');
  assert.equal(slugify('Lemigo Hôtel Intérieur'), 'lemigo-hotel-interieur');
  assert.ok(isValidSlug('rgb-building'));
  assert.ok(!isValidSlug('RGB Building'));
  const taken = new Set(['florida-house', 'florida-house-2']);
  assert.equal(await uniqueSlug('florida-house', async (s) => taken.has(s)), 'florida-house-3');
});

test('lines: one item per line, empty lines dropped, capped', () => {
  assert.deepEqual(lines('Concept design\n\n  Permits  \r\nSupervision'), ['Concept design', 'Permits', 'Supervision']);
  assert.equal(lines('a\nb\nc', 2).length, 2);
});

test('services: a draft needs only a name; publishing needs a description and a card photo', () => {
  const draft = validateService(input({ title: 'Architecture', status: 'DRAFT' }));
  assert.ok(draft.ok && draft.data.slug === 'architecture');
  const pub = validateService(input({ title: 'Architecture', status: 'PUBLISHED' }));
  assert.ok(!pub.ok && pub.errors.shortDescription && pub.errors.coverMediaId);
  const ok = validateService(input({ title: 'Architecture', status: 'PUBLISHED', shortDescription: 'Design', coverMediaId: MEDIA, icon: 'architecture', deliverables: 'Concept\nPermits' }));
  assert.ok(ok.ok && ok.data.deliverables.length === 2 && ok.data.icon === 'architecture');
  const badIcon = validateService(input({ title: 'X', icon: 'rocket' }));
  assert.ok(!badIcon.ok && badIcon.errors.icon);
});

test('projects: SAGEC fields kept; category from the list; completed projects are 100%', () => {
  const r = validateProject(
    input({
      title: 'Silverback Mall',
      status: 'PUBLISHED',
      category: 'Commercial',
      shortDescription: 'A landmark mall in Kigali.',
      coverMediaId: MEDIA,
      year: '2022',
      location: 'Kigali',
      client: 'Silverback Ltd',
      area: '12,000 m²',
      paragraphs: 'First paragraph.\nSecond paragraph.',
      state: 'COMPLETED',
      progress: '40',
      featured: 'on',
      gallery: [MEDIA, MEDIA, 'not-an-id'],
      serviceIds: [MEDIA],
    }),
  );
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.data.slug, 'silverback-mall');
  assert.equal(r.data.progress, 100);
  assert.equal(r.data.featured, true);
  assert.deepEqual(r.data.gallery, [MEDIA], 'duplicates and bad ids removed');
  assert.equal(r.data.paragraphs.length, 2);
  assert.ok(PROJECT_CATEGORIES.includes('Institutional/Civic'));

  const inProgress = validateProject(input({ title: 'RGB Building', state: 'IN_PROGRESS', progress: '150' }));
  assert.ok(inProgress.ok && inProgress.data.progress === 99, 'in-progress projects stay below 100%');
  const pub = validateProject(input({ title: 'X', status: 'PUBLISHED', category: 'Spaceport' }));
  assert.ok(!pub.ok && pub.errors.category && pub.errors.shortDescription && pub.errors.coverMediaId);
});

test('testimonials and partners: what publishing requires', () => {
  assert.ok(validateTestimonial(input({ name: 'A Client' })).ok, 'a draft can be empty');
  const t = validateTestimonial(input({ name: 'A Client', status: 'PUBLISHED' }));
  assert.ok(!t.ok && t.errors.quote);
  const p = validatePartner(input({ name: 'Partner', status: 'PUBLISHED', website: 'example.rw' }));
  assert.ok(!p.ok && p.errors.logoMediaId);
  const ok = validatePartner(input({ name: 'Partner', status: 'PUBLISHED', website: 'example.rw', logoMediaId: MEDIA }));
  assert.ok(ok.ok && ok.data.website === 'https://example.rw/');
});

test('job openings: opening a role needs a department and a description; emails and links checked', () => {
  const closed = validateJob(input({ title: 'Site Engineer', location: 'Kigali, Rwanda' }));
  assert.ok(closed.ok && closed.data.status === 'DRAFT' && closed.data.type === 'Full-time');
  const open = validateJob(input({ title: 'Site Engineer', location: 'Kigali', status: 'PUBLISHED' }));
  assert.ok(!open.ok && open.errors.department && open.errors.description);
  const bad = validateJob(input({ title: 'X', location: 'Kigali', applyEmail: 'nope', applyLink: 'not a link', department: 'Astronomy' }));
  assert.ok(!bad.ok && bad.errors.applyEmail && bad.errors.applyLink && bad.errors.department);
  const ok = validateJob(input({ title: 'Site Engineer', location: 'Kigali', status: 'PUBLISHED', department: JOB_DEPARTMENTS[1], description: 'Supervise sites.', requirements: 'Civil degree\n3 years' }));
  assert.ok(ok.ok && ok.data.requirements.length === 2);
});
