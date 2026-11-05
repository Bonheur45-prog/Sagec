import type { Metadata, Viewport } from 'next';
import type { ReactNode, CSSProperties } from 'react';
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/outfit';
import '@fontsource-variable/dm-sans';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource-variable/montserrat';
import '@fontsource-variable/lora';
import '@fontsource-variable/merriweather';
import '@fontsource-variable/playfair-display';
import '@site/styles/globals.css';
import '@site/styles/animations.css';
import '@site/styles/fonts.css';
import SiteProviders from '@site/SiteProviders';
import { GoogleAnalytics } from '@/components/layout/GoogleAnalytics';
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT } from '@/lib/fonts';
import { getSiteChrome } from '@/lib/site/chrome';
import { prefetch } from '@/lib/site/prefetch';
import { buildMetadata } from '@/lib/site/seo';

// Root layout of the public website (the CMS at /admin has its own).
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return { ...(await buildMetadata({ pageKey: 'home', path: '/' })), icons: { icon: '/favicon.png' } };
}

export const viewport: Viewport = { themeColor: '#1B2A4A' };

export default async function SiteRootLayout({ children }: { children: ReactNode }) {
  const [chrome, { state }] = await Promise.all([getSiteChrome(), prefetch([['company-info']])]);
  const { googleAnalyticsId, headingFont, bodyFont, ...visible } = chrome;
  // Fonts chosen in CMS → Site settings replace the brand fonts everywhere on the site.
  const fontStyle = {
    ...(headingFont !== DEFAULT_HEADING_FONT ? { '--font-heading': `var(--font-${headingFont})` } : {}),
    ...(bodyFont !== DEFAULT_BODY_FONT ? { '--font-body': `var(--font-${bodyFont})` } : {}),
  } as CSSProperties;
  return (
    <html lang="en" style={fontStyle}>
      <body>
        <SiteProviders chrome={visible} state={state}>
          {children}
        </SiteProviders>
        {/* Public pages only: the CMS (/admin) has its own root layout and is never tracked. */}
        <GoogleAnalytics id={googleAnalyticsId} />
      </body>
    </html>
  );
}
