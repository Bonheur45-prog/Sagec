// Header and footer as stored in GlobalSection (draft/published JSON). English only: every text is a
// plain string. Pure: parsing, publish checks and the starter content (tested in phase2.test.ts).
//
// The starter content matches the current SAGEC site (frontend/src/data/navigation.js and
// components/layout/Footer.jsx), so publishing without edits changes nothing visitors see.

export type Problems = Record<string, string>;

export type LinkDoc = { id: string; label: string; url: string; newTab: boolean };
export type NavChildDoc = { id: string; label: string; url: string; description: string };
export type NavItemDoc = LinkDoc & { children: NavChildDoc[] };

export type HeaderDoc = {
  navItems: NavItemDoc[];
  cta: { enabled: boolean; label: string; url: string; newTab: boolean };
  topBar: { enabled: boolean; message: string; showPhone: boolean; showEmail: boolean; showSocials: boolean };
  sticky: boolean;
  /** See-through header over the hero photo on pages that have one, solid once the visitor scrolls. */
  transparentOnHero: boolean;
};

export type FooterDoc = {
  quickLinksHeading: string;
  quickLinks: LinkDoc[];
  servicesHeading: string;
  /** The services column lists the published services (Phase 3), with a "View all services" link. */
  showServices: boolean;
  contactHeading: string;
  /** "{year}" is replaced by the current year. Empty = "© {year} <legal name>. All rights reserved." */
  copyright: string;
  legalLinks: LinkDoc[];
  /** Small "Built by" credit at the bottom right. Hidden when the name is empty. */
  credit: { prefix: string; name: string; url: string };
};

export const MAX_NAV_ITEMS = 10;
export const MAX_CHILDREN = 12;
export const MAX_LINKS = 15;

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
/** A string, trimmed and cut to `max`. An old { en: "…" } value (BrightLink format) is read as its English text. */
const str = (v: unknown, max = 300): string => {
  if (typeof v === 'string') return v.trim().slice(0, max);
  const en = obj(v).en;
  return typeof en === 'string' ? en.trim().slice(0, max) : '';
};
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
const id = (v: unknown, i: number) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : `i${i}`);

const link = (prefix: string) => (l: { label: string; url: string }, i: number): LinkDoc => ({ id: `${prefix}${i}`, label: l.label, url: l.url, newTab: false });

const MAIN_PAGES = [
  { label: 'Home', url: '/' },
  { label: 'About Us', url: '/about' },
  { label: 'Services', url: '/services' },
  { label: 'Projects', url: '/projects' },
  { label: 'Testimonials', url: '/testimonials' },
  { label: 'Careers', url: '/careers' },
  { label: 'Blog', url: '/blog' },
  { label: 'Contact', url: '/contact' },
];

/** Addresses offered in the link boxes' suggestion list. */
export const SITE_PAGES = MAIN_PAGES.map((p) => p.url);

export function defaultHeaderDoc(): HeaderDoc {
  return {
    navItems: MAIN_PAGES.map((p, i) => ({ ...link('n')(p, i), children: [] })),
    cta: { enabled: true, label: 'Let’s Build', url: '/contact', newTab: false },
    topBar: { enabled: false, message: '', showPhone: true, showEmail: true, showSocials: true },
    sticky: true,
    transparentOnHero: true,
  };
}

export function defaultFooterDoc(): FooterDoc {
  return {
    quickLinksHeading: 'Quick Links',
    // The old footer linked "News" to /news, which does not exist; the blog is at /blog.
    quickLinks: MAIN_PAGES.map(link('q')),
    servicesHeading: 'Our Services',
    showServices: true,
    contactHeading: 'Get In Touch',
    copyright: '',
    legalLinks: [],
    credit: { prefix: 'Built by', name: '', url: '' }, // TODO: confirm whether SAGEC wants the developer credit shown
  };
}

const parseLink = (v: unknown, i: number): LinkDoc => {
  const o = obj(v);
  return { id: id(o.id, i), label: str(o.label, 80), url: str(o.url, 500), newTab: bool(o.newTab, false) };
};

/** Anything (saved JSON, editor input) → a valid HeaderDoc. An empty object gives the starter header. */
export function parseHeader(raw: unknown): HeaderDoc {
  const o = obj(raw);
  if (!Object.keys(o).length) return defaultHeaderDoc();
  const cta = obj(o.cta);
  const top = obj(o.topBar);
  return {
    navItems: arr(o.navItems)
      .slice(0, MAX_NAV_ITEMS)
      .map((v, i) => ({
        ...parseLink(v, i),
        children: arr(obj(v).children)
          .slice(0, MAX_CHILDREN)
          .map((c, j) => {
            const co = obj(c);
            return { id: id(co.id, j), label: str(co.label, 80), url: str(co.url, 500), description: str(co.description, 160) };
          }),
      })),
    cta: { enabled: bool(cta.enabled, false), label: str(cta.label, 40), url: str(cta.url, 500), newTab: bool(cta.newTab, false) },
    topBar: {
      enabled: bool(top.enabled, false),
      message: str(top.message, 160),
      showPhone: bool(top.showPhone, true),
      showEmail: bool(top.showEmail, true),
      showSocials: bool(top.showSocials, true),
    },
    sticky: bool(o.sticky, true),
    transparentOnHero: bool(o.transparentOnHero, true),
  };
}

export function parseFooter(raw: unknown): FooterDoc {
  const o = obj(raw);
  if (!Object.keys(o).length) return defaultFooterDoc();
  const d = defaultFooterDoc();
  const credit = obj(o.credit);
  return {
    quickLinksHeading: str(o.quickLinksHeading, 60) || d.quickLinksHeading,
    quickLinks: arr(o.quickLinks).slice(0, MAX_LINKS).map(parseLink),
    servicesHeading: str(o.servicesHeading, 60) || d.servicesHeading,
    showServices: bool(o.showServices, true),
    contactHeading: str(o.contactHeading, 60) || d.contactHeading,
    copyright: str(o.copyright, 200),
    legalLinks: arr(o.legalLinks).slice(0, MAX_LINKS).map(parseLink),
    credit: { prefix: str(credit.prefix, 40), name: str(credit.name, 80), url: str(credit.url, 500) },
  };
}

/** Allowed link targets: a page on this site (/…), a section (#…), a web address, email or phone. */
export function linkProblem(url: string): string | null {
  if (!url) return 'Add a link.';
  if (/^\/(?!\/)[^\s]*$/.test(url) || /^#[\w-]+$/.test(url) || /^(mailto:|tel:)\S+$/.test(url)) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? null : 'Use a web address starting with https://';
  } catch {
    return 'Use a page on this site (/about), or a full address (https://…).';
  }
}

export function headerProblems(doc: HeaderDoc): Problems {
  const p: Problems = {};
  if (!doc.navItems.length) p.navItems = 'Add at least one menu item.';
  doc.navItems.forEach((n, i) => {
    if (!n.label) p[`nav.${i}.label`] = 'Add a label.';
    // A menu item with a dropdown may have no link of its own.
    if (!(n.children.length && !n.url)) {
      const lp = linkProblem(n.url);
      if (lp) p[`nav.${i}.url`] = lp;
    }
    n.children.forEach((c, j) => {
      if (!c.label) p[`nav.${i}.${j}.label`] = 'Add a label.';
      const lp = linkProblem(c.url);
      if (lp) p[`nav.${i}.${j}.url`] = lp;
    });
  });
  if (doc.cta.enabled) {
    if (!doc.cta.label) p['cta.label'] = 'Add the button text.';
    const lp = linkProblem(doc.cta.url);
    if (lp) p['cta.url'] = lp;
  }
  return p;
}

export function footerProblems(doc: FooterDoc): Problems {
  const p: Problems = {};
  const links = (list: LinkDoc[], key: string) =>
    list.forEach((l, i) => {
      if (!l.label) p[`${key}.${i}.label`] = 'Add a label.';
      const lp = linkProblem(l.url);
      if (lp) p[`${key}.${i}.url`] = lp;
    });
  links(doc.quickLinks, 'quickLinks');
  links(doc.legalLinks, 'legalLinks');
  if (doc.credit.name && doc.credit.url) {
    const lp = linkProblem(doc.credit.url);
    if (lp) p['credit.url'] = lp;
  }
  return p;
}

/** The copyright line as visitors see it. */
export function copyrightLine(doc: FooterDoc, legalName: string, year = new Date().getFullYear()): string {
  const text = doc.copyright || '© {year} ' + (legalName || 'SAGEC Ltd') + '. All rights reserved.';
  return text.replaceAll('{year}', String(year));
}
