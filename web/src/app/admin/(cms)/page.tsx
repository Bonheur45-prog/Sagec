import type { Metadata } from 'next';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { StatCard } from '@/components/admin/StatCard/StatCard';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { missingR2Settings } from '@/lib/storage/r2';

export const metadata: Metadata = { title: 'Dashboard' };

/** What still needs setting up on the server, so nothing fails silently later. */
function setupWarnings(): { title: string; text: string }[] {
  const warnings: { title: string; text: string }[] = [];
  const r2 = missingR2Settings();
  if (r2.length) warnings.push({ title: 'File storage is not set up', text: `Add ${r2.join(', ')} to .env. Photos and videos cannot be uploaded until then.` });
  if (!process.env.SITE_URL) warnings.push({ title: 'SITE_URL is not set', text: 'Add the public address (https://…) to .env. It is used in the sitemap, share links and canonical addresses.' });
  // Phase 3 adds the email (SMTP) and spam-protection (Turnstile) checks, with the contact form.
  return warnings;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [media, users, settings] = await Promise.all([
    prisma.mediaAsset.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { active: true } }),
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { googleAnalyticsId: true } }),
  ]);
  const analytics = settings?.googleAnalyticsId ?? '';
  const warnings = setupWarnings();

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} description="Manage everything that appears on the SAGEC Ltd website." />
      {warnings.map((w) => (
        <Notice key={w.title} tone="warning" title={w.title}>
          {w.text}
        </Notice>
      ))}
      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))' }}>
        <StatCard label="Files in the media library" value={media} href="/admin/media" />
        <StatCard label="Active users" value={users} href="/admin/users" />
        <StatCard label={analytics ? `Google Analytics · ${analytics}` : 'Google Analytics is off'} value={analytics ? 'On' : 'Off'} href="/admin/settings" />
      </div>
    </>
  );
}
