import { HydrationBoundary } from '@tanstack/react-query';
import CareersPage from '@pages/CareersPage';
import { prefetch } from '@/lib/site/prefetch';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildMetadata({ pageKey: 'careers', path: '/careers', title: "Careers", description: "Join the SAGEC Ltd team — explore current career opportunities in architecture, engineering, and construction." });

export default async function Page() {
  const { state } = await prefetch([["careers-page"], ["jobs"]]);
  return (
    <HydrationBoundary state={state}>
      <CareersPage />
    </HydrationBoundary>
  );
}
