import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emptyRow, humanize, parseFields } from './fields';
import { PAGE_SLUGS, mediaFieldPaths, pageProblems, pageSchema, parsePage, starterPage } from './schema';

test('every page has a field list', () => {
  for (const slug of PAGE_SLUGS) assert.ok(pageSchema(slug).fields.length > 0, slug);
});

test('an empty page gives SAGEC’s starter text', () => {
  const home = parsePage('home-page', {});
  const hero = home.hero as { eyebrow: string; slides: { headline: string; id: string; image: unknown }[] };
  assert.equal(hero.eyebrow, (starterPage('home-page').hero as { eyebrow: string }).eyebrow);
  assert.equal(hero.slides[0].headline, 'Building Excellence');
  assert.equal(hero.slides[0].id, 'r0');
  assert.equal(hero.slides[0].image, null);
});

test('only known fields are kept, values are coerced', () => {
  const doc = parsePage('testimonials-page', { eyebrow: 'Hi', hacker: '<script>', backgroundImage: { id: 'abc123def456' }, subline: 42 });
  assert.equal(doc.eyebrow, 'Hi');
  assert.equal('hacker' in doc, false);
  assert.equal(doc.backgroundImage, 'abc123def456'); // an old Payload media object becomes its id
  assert.equal(doc.subline, '');
});

test('collapsible boxes (Payload layout) are opened up', () => {
  const careers = parsePage('careers-page', {});
  assert.equal(typeof careers.headline, 'string');
  assert.ok((careers.headline as string).length > 0);
});

test('required texts are reported with their path', () => {
  const doc = parsePage('home-page', {});
  ((doc.hero as { slides: { headline: string }[] }).slides[1]).headline = '';
  const p = pageProblems('home-page', doc);
  assert.equal(p['hero.slides.1.headline'], 'This is needed on the website.');
});

test('photo fields are found inside groups and lists', () => {
  const paths = mediaFieldPaths('home-page').map((p) => p.join('.'));
  assert.ok(paths.includes('hero.slides.image'));
  assert.ok(paths.includes('hero.slides.video'));
});

test('helpers', () => {
  assert.equal(humanize('headlineLine1'), 'Headline line 1');
  assert.equal(humanize('primaryBtnLabel'), 'Primary button label');
  const slides = pageSchema('home-page').fields.find((f) => f.name === 'hero')!.fields!.find((f) => f.name === 'slides')!;
  const row = emptyRow(slides, 'x1');
  assert.equal(row.id, 'x1');
  assert.equal(row.type, 'image'); // select default
  assert.deepEqual(parseFields([{ name: 'n', type: 'number' }], { n: '12' }), { n: 12 });
});
