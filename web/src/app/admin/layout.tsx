import type { Metadata } from 'next';
import type { ReactNode } from 'react';
// SAGEC brand fonts, self-hosted from npm (no Google Fonts request at build or run time).
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@/styles/admin-tokens.css';
import '@/styles/admin.css';

// Root layout for the CMS (the public site has its own under (site)). English only.
export const metadata: Metadata = {
  title: { default: 'SAGEC CMS', template: '%s | SAGEC CMS' },
  robots: { index: false, follow: false },
  icons: { icon: '/images/brand/sagec-mark.png' },
};

// Everything in the CMS is per-user and always fresh.
export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
