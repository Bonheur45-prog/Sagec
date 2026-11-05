import type { Metadata } from 'next';
import { HydrationBoundary } from '@tanstack/react-query';
import ServiceDetailPage from '@pages/ServiceDetailPage';
import { loadKey, prefetch } from '@/lib/site/prefetch';
import { redirectOrNotFound } from '@/lib/site/redirects';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };
type Service = { title: string; description: string; metaTitle: string; metaDescription: string; image?: { url: string } | null; detailImage?: { url: string } | null } | null;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = (await loadKey(['services', slug]).catch(() => null)) as Service;
  if (!s) return { title: 'Page not found', robots: { index: false } };
  return buildMetadata({ title: s.metaTitle || s.title, description: s.metaDescription || s.description, image: s.detailImage?.url ?? s.image?.url, path: `/services/${slug}` });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { state, data } = await prefetch([['services', slug], ['services']]);
  if (!data.get(`services/${slug}`)) await redirectOrNotFound(`/services/${slug}`);
  return (
    <HydrationBoundary state={state}>
      <ServiceDetailPage />
    </HydrationBoundary>
  );
}
