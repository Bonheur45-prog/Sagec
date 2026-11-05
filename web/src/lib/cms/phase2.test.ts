import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_HEADING_FONT, FONTS, isFontKey } from '../fonts';
import {
  copyrightLine,
  defaultFooterDoc,
  defaultHeaderDoc,
  footerProblems,
  headerProblems,
  linkProblem,
  parseFooter,
  parseHeader,
} from './globals-model';
import { analyticsId, validateSettings, verificationCode, type Input } from './settings-validation';

const input = (values: Record<string, string | string[]>): Input => ({
  get: (n) => (Array.isArray(values[n]) ? (values[n] as string[])[0] : (values[n] as string)) ?? '',
  getAll: (n) => (Array.isArray(values[n]) ? (values[n] as string[]) : values[n] ? [values[n] as string] : []),
});

const valid = {
  companyName: 'SAGEC Ltd',
  legalName: 'SAGEC Ltd',
  publicEmail: 'SagecLtd@Gmail.com',
  notificationEmail: 'sagecltd@gmail.com',
  titleTemplate: '%s | SAGEC Ltd',
  seoTitle: 'SAGEC Ltd',
  seoDescription: 'Architectural and Engineering Solutions in Kigali.',
};

test('fonts: curated list with unique keys; SAGEC brand font is the heading default', () => {
  assert.equal(new Set(FONTS.map((f) => f.key)).size, FONTS.length);
  assert.equal(DEFAULT_HEADING_FONT, 'plus-jakarta-sans');
  assert.ok(isFontKey('inter'));
  assert.ok(!isFontKey('comic-sans'));
});

test('settings: valid input is cleaned; unknown fonts fall back; socials must be the right site', () => {
  const r = validateSettings(input({ ...valid, headingFont: 'nope', bodyFont: 'lora', smoothScroll: 'on', 'social.linkedin': 'linkedin.com/company/sagec' }));
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.data.publicEmail, 'sagecltd@gmail.com');
  assert.equal(r.data.headingFont, 'plus-jakarta-sans');
  assert.equal(r.data.bodyFont, 'lora');
  assert.equal(r.data.smoothScroll, true);
  assert.equal(r.data.parallax, false);
  assert.deepEqual(r.data.socials, [{ platform: 'linkedin', url: 'https://linkedin.com/company/sagec' }]);

  const bad = validateSettings(input({ ...valid, 'social.facebook': 'https://linkedin.com/x' }));
  assert.ok(!bad.ok && bad.errors['social.facebook']);
});

test('settings: required fields and title pattern', () => {
  const r = validateSettings(input({ ...valid, companyName: '', seoTitle: '', titleTemplate: 'no placeholder' }));
  assert.ok(!r.ok);
  if (r.ok) return;
  assert.ok(r.errors.companyName);
  assert.ok(r.errors.seoTitle);
  assert.ok(r.errors.titleTemplate);
});

test('settings: WhatsApp number keeps digits only, and must be a real length', () => {
  const r = validateSettings(input({ ...valid, whatsappNumber: '+250 788 470 243' }));
  assert.ok(r.ok && r.data.whatsappNumber === '250788470243');
  const bad = validateSettings(input({ ...valid, whatsappNumber: '12ab' }));
  assert.ok(!bad.ok && bad.errors.whatsappNumber);
});

test('settings: opening hours rows — complete rows kept, empty rows dropped, half rows refused', () => {
  const r = validateSettings(
    input({ ...valid, 'hours.0.day': 'Monday – Friday', 'hours.0.hours': '8:00 AM – 5:00 PM', 'hours.1.day': '', 'hours.1.hours': '', 'hours.2.day': 'Sunday', 'hours.2.hours': 'Closed' }),
  );
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.data.businessHours, [{ day: 'Monday – Friday', hours: '8:00 AM – 5:00 PM' }, { day: 'Sunday', hours: 'Closed' }]);
  const half = validateSettings(input({ ...valid, 'hours.0.day': 'Saturday' }));
  assert.ok(!half.ok && half.errors['hours.0.hours']);
});

test('Google Analytics: the G- ID is taken from the ID or from the whole tag snippet; anything else is refused', () => {
  assert.equal(analyticsId(' g-ab12cd34ef '), 'G-AB12CD34EF');
  const snippet = `<!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-XYZ12345"></script><script>gtag('config', 'G-XYZ12345');</script>`;
  assert.equal(analyticsId(snippet), 'G-XYZ12345');
  const ok = validateSettings(input({ ...valid, googleAnalyticsId: snippet }));
  assert.ok(ok.ok && ok.data.googleAnalyticsId === 'G-XYZ12345');
  const off = validateSettings(input({ ...valid, googleAnalyticsId: '' }));
  assert.ok(off.ok && off.data.googleAnalyticsId === '', 'empty = analytics off');
  const bad = validateSettings(input({ ...valid, googleAnalyticsId: 'UA-12345-1' }));
  assert.ok(!bad.ok && bad.errors.googleAnalyticsId, 'old Universal Analytics IDs are refused');
});

test('Search Console: the code is taken from a pasted meta tag', () => {
  assert.equal(verificationCode('<meta name="google-site-verification" content="abc123XYZ" />'), 'abc123XYZ');
  assert.equal(verificationCode(' abc123XYZ '), 'abc123XYZ');
});

test('header/footer: empty data gives the current SAGEC header and footer', () => {
  const h = parseHeader({});
  assert.deepEqual(h, defaultHeaderDoc());
  assert.deepEqual(h.navItems.map((n) => n.url), ['/', '/about', '/services', '/projects', '/testimonials', '/careers', '/blog', '/contact']);
  assert.equal(h.cta.label, 'Let’s Build');
  assert.equal(h.cta.url, '/contact');
  assert.equal(h.topBar.enabled, false, 'SAGEC has no top bar today');
  assert.deepEqual(headerProblems(h), {}, 'the starter header can be published as is');

  const f = parseFooter({});
  assert.deepEqual(f, defaultFooterDoc());
  assert.ok(f.quickLinks.some((l) => l.url === '/blog') && !f.quickLinks.some((l) => l.url === '/news'), 'the broken /news link is not carried over');
  assert.deepEqual(footerProblems(f), {});
});

test('header/footer: stored data is cleaned; old { en } values are read as plain text', () => {
  const h = parseHeader({ navItems: [{ id: 'a', label: { en: ' About ' }, url: '/about', children: [{ label: 'Team', url: '/about#team', description: 'Who we are' }] }], cta: { enabled: true, label: 'Call', url: 'tel:+250788470243' } });
  assert.equal(h.navItems[0].label, 'About');
  assert.equal(h.navItems[0].children[0].url, '/about#team');
  assert.deepEqual(headerProblems(h), {});
  const p = headerProblems(parseHeader({ navItems: [{ label: '', url: 'javascript:alert(1)' }] }));
  assert.ok(p['nav.0.label'] && p['nav.0.url']);
});

test('links: site pages, sections, web, email and phone are allowed; others are not', () => {
  for (const ok of ['/', '/projects/silverback-mall', '#contact', 'https://sagecltd.com', 'mailto:a@b.rw', 'tel:+250788470243']) assert.equal(linkProblem(ok), null, ok);
  for (const bad of ['', '//evil.com', 'javascript:alert(1)', 'ftp://x', 'about us']) assert.ok(linkProblem(bad), bad);
});

test('footer: copyright line uses {year} and falls back to the legal name', () => {
  const f = parseFooter({ copyright: '© 2020–{year} SAGEC' });
  assert.equal(copyrightLine(f, 'SAGEC Ltd', 2027), '© 2020–2027 SAGEC');
  assert.equal(copyrightLine(defaultFooterDoc(), 'SAGEC Ltd', 2026), '© 2026 SAGEC Ltd. All rights reserved.');
  const credit = footerProblems(parseFooter({ quickLinks: [], credit: { prefix: 'Built by', name: 'BrightLink', url: 'not a link' } }));
  assert.ok(credit['credit.url']);
});
