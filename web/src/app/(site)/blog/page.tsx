import { HydrationBoundary } from '@tanstack/react-query';
import BlogPage from '@pages/BlogPage';
import { prefetch } from '@/lib/site/prefetch';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildMetadata({ pageKey: 'blog', path: '/blog', title: "Blog" });

export default async function Page() {
  const { state } = await prefetch([["blog-page"], ["blog-posts"], ["tags"]]);
  return (
    <HydrationBoundary state={state}>
      <BlogPage />
    </HydrationBoundary>
  );
}
