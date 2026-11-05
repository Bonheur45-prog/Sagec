import type { Metadata } from 'next';
import { HydrationBoundary } from '@tanstack/react-query';
import ProjectDetailPage from '@pages/ProjectDetailPage';
import { loadKey, prefetch } from '@/lib/site/prefetch';
import { redirectOrNotFound } from '@/lib/site/redirects';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };
type Project = { title: string; shortDescription: string; metaTitle: string; metaDescription: string; coverImage?: { url: string } | null; featuredImage?: { url: string } | null } | null;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await loadKey(['projects', slug]).catch(() => null)) as Project;
  if (!p) return { title: 'Page not found', robots: { index: false } };
  return buildMetadata({ title: p.metaTitle || p.title, description: p.metaDescription || p.shortDescription, image: p.featuredImage?.url ?? p.coverImage?.url, path: `/projects/${slug}` });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { state, data } = await prefetch([['projects', slug], ['projects'], ['projects-page']]);
  if (!data.get(`projects/${slug}`)) await redirectOrNotFound(`/projects/${slug}`);
  return (
    <HydrationBoundary state={state}>
      <ProjectDetailPage />
    </HydrationBoundary>
  );
}
