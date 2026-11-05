import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Root layout for the public website. TODO(Phase 6): the real SAGEC site is ported here from
// ../frontend (header, footer, fonts, styles, SEO, Google Analytics).
export const metadata: Metadata = {
  title: 'SAGEC Ltd',
  robots: { index: false, follow: false }, // TODO(Phase 6): remove once the real site is here
};

export default function SiteRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
