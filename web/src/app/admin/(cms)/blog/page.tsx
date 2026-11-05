import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/admin/Button/Button';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { TextInput } from '@/components/admin/Field/Field';
import { EmptyState } from '@/components/admin/EmptyState/EmptyState';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge/StatusBadge';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import type { Search } from '../_collections/shared';
import styles from '../_collections/shared.module.css';
import { createPost } from './actions';

export const metadata: Metadata = { title: 'Blog' };
const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Africa/Kigali' });

export default async function BlogList({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const [posts, categories] = await Promise.all([
    prisma.post.findMany({ where: { deletedAt: null }, orderBy: [{ publishedAt: { sort: 'desc', nulls: 'first' } }, { createdAt: 'desc' }], include: { category: { select: { name: true } } } }),
    prisma.blogCategory.count(),
  ]);
  const { notice, error } = noticeFrom(await searchParams);
  const now = new Date();
  return (
    <>
      <PageHeader
        title="Blog"
        description="Articles. Drafts and scheduled articles are not on the website."
        actions={
          <>
            <Button href="/admin/blog/categories">Categories</Button>
            <Button href="/admin/blog/authors">Authors</Button>
          </>
        }
      />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      {categories === 0 ? (
        <Notice tone="warning" title="No categories yet">
          Every article belongs to a category. <Link href="/admin/blog/categories">Add categories</Link> first.
        </Notice>
      ) : (
        <form action={createPost} className={styles.create}>
          <label htmlFor="new-name" className={styles.srOnly}>Title of a new article</label>
          <TextInput id="new-name" name="name" placeholder="Title of a new article" maxLength={160} required />
          <ConfirmButton variant="primary">Create</ConfirmButton>
        </form>
      )}
      {posts.length === 0 ? (
        <EmptyState title="No articles yet." />
      ) : (
        <ul className={styles.list}>
          {posts.map((p) => {
            const scheduled = p.status === 'PUBLISHED' && p.publishedAt && p.publishedAt > now;
            const title = p.title || p.slug;
            return (
              <li key={p.id} className={styles.row}>
                <Link href={`/admin/blog/${p.id}`} className={styles.title}>
                  {p.featured ? '★ ' : ''}
                  {title}
                  <span className={styles.sub}>
                    {p.category.name}
                    {p.publishedAt ? ` · ${scheduled ? 'scheduled for' : ''} ${when.format(p.publishedAt)}` : ''}
                  </span>
                </Link>
                <StatusBadge status={scheduled ? 'SCHEDULED' : p.status} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
