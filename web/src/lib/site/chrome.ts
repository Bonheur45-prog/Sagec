import 'server-only';
import { cache } from 'react';
import { getPublished } from '@/lib/cms/drafts';
import { defaultFooterDoc, defaultHeaderDoc, type FooterDoc, type HeaderDoc } from '@/lib/cms/globals-model';
import { prisma } from '@/lib/db';
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, isFontKey, type FontKey } from '@/lib/fonts';
import { turnstileSiteKey } from '@/lib/security/turnstile';

/** Everything the frame of every public page needs (menu, footer, names, fonts, analytics), read once per request. */
export type SiteChrome = {
  header: HeaderDoc;
  footer: FooterDoc;
  companyName: string;
  legalName: string;
  services: { title: string; slug: string }[];
  turnstileSiteKey: string | null;
  headingFont: FontKey;
  bodyFont: FontKey;
  googleAnalyticsId: string;
};

export const getSiteChrome = cache(async (): Promise<SiteChrome> => {
  try {
    const [header, footer, settings, services] = await Promise.all([
      getPublished('header'),
      getPublished('footer'),
      prisma.siteSettings.findUnique({ where: { id: 1 } }),
      prisma.service.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], select: { title: true, slug: true } }),
    ]);
    return {
      header: header ?? defaultHeaderDoc(),
      footer: footer ?? defaultFooterDoc(),
      companyName: settings?.companyName || 'SAGEC Ltd',
      legalName: settings?.legalName || settings?.companyName || 'SAGEC Ltd',
      services,
      turnstileSiteKey: turnstileSiteKey(),
      headingFont: isFontKey(settings?.headingFont) ? settings!.headingFont : DEFAULT_HEADING_FONT,
      bodyFont: isFontKey(settings?.bodyFont) ? settings!.bodyFont : DEFAULT_BODY_FONT,
      googleAnalyticsId: settings?.googleAnalyticsId ?? '',
    };
  } catch (error) {
    // Database unreachable: the page still renders its built-in menu and footer.
    console.error('[site] could not load the page frame', error);
    return {
      header: defaultHeaderDoc(),
      footer: defaultFooterDoc(),
      companyName: 'SAGEC Ltd',
      legalName: 'SAGEC Ltd',
      services: [],
      turnstileSiteKey: turnstileSiteKey(),
      headingFont: DEFAULT_HEADING_FONT,
      bodyFont: DEFAULT_BODY_FONT,
      googleAnalyticsId: '',
    };
  }
});
