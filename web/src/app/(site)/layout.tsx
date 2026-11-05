import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GoogleAnalytics } from '@/components/layout/GoogleAnalytics';
import { prisma } from '@/lib/db';

// Root layout for the public website. TODO(Phase 6): the real SAGEC site is ported here from
// ../frontend (header, footer, fonts, styles, SEO).
export const metadata: Metadata = {
  title: 'SAGEC Ltd',
  robots: { index: false, follow: false }, // TODO(Phase 6): remove once the real site is here
};

/** The Google Analytics ID from Site settings; empty when not set or when the database is unreachable. */
async function analyticsId(): Promise<string> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { googleAnalyticsId: true } });
    return row?.googleAnalyticsId ?? '';
  } catch {
    return '';
  }
}

export default async function SiteRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Public pages only: the CMS (/admin) has its own root layout and is never tracked. */}
        <GoogleAnalytics id={await analyticsId()} />
      </body>
    </html>
  );
}
