import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { SettingsForm, type SettingsInitial } from '@/components/admin/SettingsForm/SettingsForm';
import type { PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { requireUser } from '@/lib/auth/session';
import { DEFAULT_SETTINGS } from '@/lib/cms/settings-defaults';
import type { HoursRow } from '@/lib/cms/settings-validation';
import { prisma } from '@/lib/db';
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, isFontKey } from '@/lib/fonts';
import { toAdminMedia } from '@/lib/storage/assets';

export const metadata: Metadata = { title: 'Site settings' };

export default async function SettingsPage() {
  await requireUser();
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const ids = [row?.logoMediaId, row?.logoLightMediaId, row?.defaultOgMediaId].filter((v): v is string => !!v);
  const media = ids.length ? await prisma.mediaAsset.findMany({ where: { id: { in: ids } } }) : [];
  const picked = (id: string | null | undefined): PickedMedia | null => {
    const m = media.find((x) => x.id === id);
    if (!m) return null;
    try {
      const a = toAdminMedia(m);
      return { id: a.id, thumbUrl: a.thumbUrl, alt: a.alt, kind: a.kind };
    } catch {
      return { id: m.id, thumbUrl: null, alt: '' }; // R2 address not configured: keep the choice, no preview
    }
  };
  const d = DEFAULT_SETTINGS;
  const socials = Array.isArray(row?.socials) ? (row!.socials as { platform?: string; url?: string }[]) : d.socials;
  const hours = Array.isArray(row?.businessHours) ? (row!.businessHours as HoursRow[]) : [...d.businessHours];

  const initial: SettingsInitial = {
    companyName: row?.companyName ?? d.companyName,
    legalName: row?.legalName ?? d.legalName,
    tagline: row?.tagline ?? d.tagline,
    footerDescription: row?.footerDescription ?? d.footerDescription,
    phone: row?.phone ?? d.phone,
    secondaryPhone: row?.secondaryPhone ?? d.secondaryPhone,
    publicEmail: row?.publicEmail ?? d.publicEmail,
    notificationEmail: row?.notificationEmail ?? d.notificationEmail,
    whatsappNumber: row?.whatsappNumber ?? d.whatsappNumber,
    whatsappLabel: row?.whatsappLabel ?? d.whatsappLabel,
    responseNote: row?.responseNote ?? d.responseNote,
    addressStreet: row?.addressStreet ?? d.addressStreet,
    addressCity: row?.addressCity ?? d.addressCity,
    addressCountry: row?.addressCountry ?? d.addressCountry,
    addressCountryCode: row?.addressCountryCode ?? d.addressCountryCode,
    businessHours: hours,
    socials: Object.fromEntries(socials.filter((s) => s.platform && s.url).map((s) => [s.platform!, s.url!])),
    logo: picked(row?.logoMediaId),
    logoLight: picked(row?.logoLightMediaId),
    defaultOg: picked(row?.defaultOgMediaId),
    seoTitle: row?.seoTitle ?? d.seoTitle,
    seoDescription: row?.seoDescription ?? d.seoDescription,
    titleTemplate: row?.titleTemplate ?? d.titleTemplate,
    googleSiteVerification: row?.googleSiteVerification ?? '',
    googleAnalyticsId: row?.googleAnalyticsId ?? d.googleAnalyticsId,
    headingFont: isFontKey(row?.headingFont) ? row!.headingFont : DEFAULT_HEADING_FONT,
    bodyFont: isFontKey(row?.bodyFont) ? row!.bodyFont : DEFAULT_BODY_FONT,
    smoothScroll: row?.smoothScroll ?? true,
    parallax: row?.parallax ?? true,
  };

  return (
    <>
      <PageHeader title="Site settings" description="Company details, contact, social pages, search engines, Google Analytics, fonts and motion. Saving updates the website at once." />
      <SettingsForm initial={initial} />
    </>
  );
}
