import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, isFontKey, type FontKey } from '@/lib/fonts';

// Pure validation of the Site settings form (tested in phase2.test.ts). English only.

export type Input = { get(name: string): string; getAll(name: string): string[] };
export type Errors = Record<string, string>;

/** FormData → Input (files are ignored). */
export function inputFrom(data: FormData): Input {
  return {
    get: (name) => {
      const v = data.get(name);
      return typeof v === 'string' ? v : '';
    },
    getAll: (name) => data.getAll(name).filter((v): v is string => typeof v === 'string'),
  };
}

export const SOCIAL_NETWORKS = [
  { key: 'linkedin', label: 'LinkedIn', host: /(^|\.)linkedin\.com$/ },
  { key: 'facebook', label: 'Facebook', host: /(^|\.)(facebook|fb)\.com$/ },
  { key: 'instagram', label: 'Instagram', host: /(^|\.)instagram\.com$/ },
  { key: 'x', label: 'X (Twitter)', host: /(^|\.)(x|twitter)\.com$/ },
  { key: 'youtube', label: 'YouTube', host: /(^|\.)(youtube\.com|youtu\.be)$/ },
  { key: 'tiktok', label: 'TikTok', host: /(^|\.)tiktok\.com$/ },
  // No WhatsApp here: it has its own number field (the site builds the wa.me link and icon from it).
] as const;

export type HoursRow = { day: string; hours: string };

/** How many opening-hours rows the form shows. */
export const MAX_HOURS_ROWS = 7;

export type SettingsData = {
  companyName: string;
  legalName: string;
  tagline: string;
  footerDescription: string;
  phone: string;
  secondaryPhone: string;
  publicEmail: string;
  notificationEmail: string;
  whatsappNumber: string;
  whatsappLabel: string;
  responseNote: string;
  addressStreet: string;
  addressCity: string;
  addressCountry: string;
  addressCountryCode: string;
  businessHours: HoursRow[];
  socials: { platform: string; url: string }[];
  logoMediaId: string | null;
  logoLightMediaId: string | null;
  defaultOgMediaId: string | null;
  seoTitle: string;
  seoDescription: string;
  titleTemplate: string;
  googleSiteVerification: string;
  googleAnalyticsId: string;
  headingFont: FontKey;
  bodyFont: FontKey;
  smoothScroll: boolean;
  parallax: boolean;
};

export type Validation<T> = { ok: true; data: T } | { ok: false; errors: Errors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{7,25}$/;
const MEDIA_ID = /^[a-z0-9]{10,40}$/;

/** Google gives a whole <meta> tag; people paste it. Keep only the code. */
export function verificationCode(raw: string): string {
  const v = raw.trim();
  const m = v.match(/content=["']([^"']+)["']/i);
  return (m ? m[1] : v).trim();
}

/** The "G-…" ID from whatever was pasted: the ID itself or Google's whole tag snippet. */
export function analyticsId(raw: string): string {
  const v = raw.trim();
  const m = v.match(/\bG-[A-Z0-9]{4,20}\b/i);
  return (m ? m[0] : v).toUpperCase();
}

export function validateSettings(input: Input): Validation<SettingsData> {
  const errors: Errors = {};
  const text = (name: string, label: string, max: number, required = false) => {
    const value = input.get(name).trim();
    if (required && !value) errors[name] = `${label} is required.`;
    else if (value.length > max) errors[name] = `${label} can be at most ${max} characters.`;
    return value;
  };
  const email = (name: string, label: string) => {
    const value = input.get(name).trim().toLowerCase();
    if (!value) errors[name] = `${label} is required.`;
    else if (!EMAIL.test(value) || value.length > 200) errors[name] = 'Use a valid email address.';
    return value;
  };
  const phone = (name: string) => {
    const value = input.get(name).trim();
    if (value && !PHONE.test(value)) errors[name] = 'Use a phone number like +250 788 470 243.';
    return value;
  };
  const media = (name: string) => {
    const value = input.get(name).trim();
    return MEDIA_ID.test(value) ? value : null;
  };

  const companyName = text('companyName', 'Company name', 120, true);
  const legalName = text('legalName', 'Legal name', 160, true);
  const tagline = text('tagline', 'Tagline', 200);
  const footerDescription = text('footerDescription', 'Footer description', 500);
  const ph = phone('phone');
  const secondaryPhone = phone('secondaryPhone');
  const publicEmail = email('publicEmail', 'Public email');
  const notificationEmail = email('notificationEmail', 'Notification email');
  // WhatsApp links need the number as digits with the country code (wa.me/250788470243).
  const whatsappNumber = input.get('whatsappNumber').replace(/[\s()+-]/g, '');
  if (whatsappNumber && !/^\d{8,15}$/.test(whatsappNumber)) errors.whatsappNumber = 'Use the number with its country code, e.g. 250 788 470 243.';
  const whatsappLabel = text('whatsappLabel', 'WhatsApp button text', 60);
  const responseNote = text('responseNote', 'Response note', 200);
  const addressStreet = text('addressStreet', 'Street', 200);
  const addressCity = text('addressCity', 'City', 80);
  const addressCountry = text('addressCountry', 'Country', 80);
  const addressCountryCode = input.get('addressCountryCode').trim().toUpperCase();
  if (addressCountryCode && !/^[A-Z]{2}$/.test(addressCountryCode)) errors.addressCountryCode = 'Use the 2-letter code, e.g. RW.';
  const businessHours: HoursRow[] = [];
  for (let i = 0; i < MAX_HOURS_ROWS; i++) {
    const day = text(`hours.${i}.day`, 'Days', 60);
    const hours = text(`hours.${i}.hours`, 'Hours', 60);
    if (day && !hours) errors[`hours.${i}.hours`] = 'Add the hours for these days (or “Closed”).';
    else if (hours && !day) errors[`hours.${i}.day`] = 'Add which days these hours are for.';
    else if (day && hours) businessHours.push({ day, hours });
  }

  const socials: { platform: string; url: string }[] = [];
  for (const network of SOCIAL_NETWORKS) {
    const name = `social.${network.key}`;
    const raw = input.get(name).trim();
    if (!raw) continue;
    let url: URL | null = null;
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      url = null;
    }
    if (!url || url.protocol !== 'https:' || !network.host.test(url.hostname.replace(/^www\./, ''))) {
      errors[name] = `Paste the full ${network.label} link (https://…).`;
    } else socials.push({ platform: network.key, url: url.toString() });
  }

  const seoTitle = text('seoTitle', 'Default page title', 120, true);
  const seoDescription = text('seoDescription', 'Default description', 300, true);
  const titleTemplate = text('titleTemplate', 'Title pattern', 120, true);
  if (titleTemplate && !errors.titleTemplate && (titleTemplate.match(/%s/g) ?? []).length !== 1) {
    errors.titleTemplate = 'Include %s exactly once: it is replaced by the page title.';
  }
  const googleSiteVerification = verificationCode(input.get('googleSiteVerification'));
  if (googleSiteVerification.length > 120 || /[\s<>"]/.test(googleSiteVerification)) {
    errors.googleSiteVerification = 'Paste only the code Google gives you (or the whole meta tag).';
  }

  const googleAnalyticsId = analyticsId(input.get('googleAnalyticsId'));
  if (googleAnalyticsId && !/^G-[A-Z0-9]{4,20}$/.test(googleAnalyticsId)) {
    errors.googleAnalyticsId = 'Paste the Measurement ID from Google Analytics. It starts with G-, e.g. G-AB12CD34EF.';
  }

  const hf = input.get('headingFont');
  const bf = input.get('bodyFont');

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      companyName,
      legalName,
      tagline,
      footerDescription,
      phone: ph,
      secondaryPhone,
      publicEmail,
      notificationEmail,
      whatsappNumber,
      whatsappLabel,
      responseNote,
      addressStreet,
      addressCity,
      addressCountry,
      addressCountryCode,
      businessHours,
      socials,
      logoMediaId: media('logoMediaId'),
      logoLightMediaId: media('logoLightMediaId'),
      defaultOgMediaId: media('defaultOgMediaId'),
      seoTitle,
      seoDescription,
      titleTemplate,
      googleSiteVerification,
      googleAnalyticsId,
      headingFont: isFontKey(hf) ? hf : DEFAULT_HEADING_FONT,
      bodyFont: isFontKey(bf) ? bf : DEFAULT_BODY_FONT,
      smoothScroll: input.get('smoothScroll') === 'on',
      parallax: input.get('parallax') === 'on',
    },
  };
}
