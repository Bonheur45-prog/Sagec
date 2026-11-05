import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/admin/Button/Button';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import type { PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { PostEditor } from '@/components/admin/PostEditor/PostEditor';
import { requireUser } from '@/lib/auth/session';
import type { PostPayload } from '@/lib/blog/post-model';
import { imageIdsIn } from '@/lib/blog/render';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import { pickedMedia, type Search } from '../../_collections/shared';
import { trashPost } from '../actions';

export const metadata: Metadata = { title: 'Edit article' };

export default async function PostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const post = await prisma.post.findFirst({ where: { id, deletedAt: null } });
  if (!post) notFound();
  const [categories, authors, query] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
    prisma.blogAuthor.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true } }),
    searchParams,
  ]);
  const media = await pickedMedia([post.coverMediaId, post.ogMediaId, ...imageIdsIn(post.doc)]);
  const initial: PostPayload = {
    title: post.title,
    excerpt: post.excerpt,
    doc: post.doc,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    ogMediaId: post.ogMediaId,
    slug: post.slug,
    status: post.status,
    categoryId: post.categoryId,
    authorId: post.authorId,
    coverMediaId: post.coverMediaId,
    tags: post.tags,
    featured: post.featured,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    focusKeyword: post.focusKeyword,
    canonicalUrl: post.canonicalUrl,
    noIndex: post.noIndex,
  };
  const live = post.status === 'PUBLISHED' && post.publishedAt && post.publishedAt <= new Date();
  const { notice, error } = noticeFrom(query);
  return (
    <>
      <PageHeader
        title={post.title}
        back={{ href: '/admin/blog', label: 'All articles' }}
        actions={
          <>
            {live && <Button href={`/blog/${post.slug}`} newTab>View on website ↗</Button>}
            <form action={trashPost.bind(null, post.id)}>
              <ConfirmButton variant="danger" confirm="Move this article to the trash? It disappears from the website. You can restore it from Trash.">
                Move to trash
              </ConfirmButton>
            </form>
          </>
        }
      />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      <PostEditor id={post.id} initial={initial} categories={categories} authors={authors} media={[...media.values()] as PickedMedia[]} />
    </>
  );
}
