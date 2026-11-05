import type { Metadata } from 'next';
import { HydrationBoundary, QueryClient } from '@tanstack/react-query';
import BlogPostPage from '@pages/BlogPostPage';
import { loadKey, prefetch } from '@/lib/site/prefetch';
import { redirectOrNotFound } from '@/lib/site/redirects';
import { buildMetadata } from '@/lib/site/seo';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };
type Post = {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
  noIndex: boolean;
  canonicalUrl: string;
  coverImage?: { url: string } | null;
  ogImage?: { url: string } | null;
} | null;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await loadKey(['blog-posts', slug]).catch(() => null)) as Post;
  if (!p) return { title: 'Page not found', robots: { index: false } };
  const meta = await buildMetadata({
    title: p.metaTitle || p.title,
    description: p.metaDescription || p.excerpt,
    image: p.ogImage?.url ?? p.coverImage?.url,
    path: `/blog/${slug}`,
    noIndex: p.noIndex,
    type: 'article',
    publishedTime: p.publishedAt,
  });
  return p.canonicalUrl ? { ...meta, alternates: { canonical: p.canonicalUrl } } : meta;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const client = new QueryClient();
  const { data } = await prefetch([['blog-posts', slug], ['blog-posts'], ['blog-page'], ['tags']], client);
  const post = data.get(`blog-posts/${slug}`) as Post;
  if (!post) await redirectOrNotFound(`/blog/${slug}`);
  const { state } = await prefetch([['blog-comments', post!.id]], client);
  return (
    <HydrationBoundary state={state}>
      <BlogPostPage />
    </HydrationBoundary>
  );
}
