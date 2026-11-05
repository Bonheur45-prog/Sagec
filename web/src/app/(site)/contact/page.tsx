import { HydrationBoundary } from '@tanstack/react-query';
import ContactPage from '@pages/ContactPage';
import { prefetch } from '@/lib/site/prefetch';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildMetadata({ pageKey: 'contact', path: '/contact', title: "Contact Us" });

export default async function Page() {
  const { state } = await prefetch([["contact-page"]]);
  return (
    <HydrationBoundary state={state}>
      <ContactPage />
    </HydrationBoundary>
  );
}
