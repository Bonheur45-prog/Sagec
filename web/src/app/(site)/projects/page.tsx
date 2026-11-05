import { HydrationBoundary } from '@tanstack/react-query';
import ProjectsPage from '@pages/ProjectsPage';
import { prefetch } from '@/lib/site/prefetch';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildMetadata({ pageKey: 'projects', path: '/projects', title: "Our Projects" });

export default async function Page() {
  const { state } = await prefetch([["projects-page"], ["projects"]]);
  return (
    <HydrationBoundary state={state}>
      <ProjectsPage />
    </HydrationBoundary>
  );
}
