import type { Metadata } from 'next';
import Link from 'next/link';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { EmptyState } from '@/components/admin/EmptyState/EmptyState';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge/StatusBadge';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import { deleteComment, setCommentApproved } from '../blog/actions';
import type { Search } from '../_collections/shared';
import styles from '../_collections/shared.module.css';

export const metadata: Metadata = { title: 'Comments' };
const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kigali' });

export default async function CommentsPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const sp = await searchParams;
  const view = sp.view === 'approved' ? 'approved' : 'waiting';
  const comments = await prisma.blogComment.findMany({
    where: { approved: view === 'approved' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { post: { select: { title: true, id: true } } },
  });
  const waiting = await prisma.blogComment.count({ where: { approved: false } });
  const { notice } = noticeFrom(sp);
  return (
    <>
      <PageHeader
        title="Comments"
        description="Visitors’ comments on articles. Nothing appears on the website until you approve it. The email address is never shown."
      />
      {notice && <Notice tone="success">{notice}</Notice>}
      <p style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <Link href="/admin/comments" aria-current={view === 'waiting' ? 'page' : undefined} style={{ fontWeight: view === 'waiting' ? 700 : 400 }}>Waiting ({waiting})</Link>
        <Link href="/admin/comments?view=approved" aria-current={view === 'approved' ? 'page' : undefined} style={{ fontWeight: view === 'approved' ? 700 : 400 }}>Approved</Link>
      </p>
      {comments.length === 0 ? (
        <EmptyState title={view === 'waiting' ? 'No comments waiting.' : 'No approved comments yet.'} />
      ) : (
        <ul className={styles.list}>
          {comments.map((c) => (
            <li key={c.id} className={styles.row} style={{ alignItems: 'flex-start' }}>
              <div className={styles.title} style={{ fontWeight: 400 }}>
                <strong>{c.name}</strong>
                <span className={styles.sub}>
                  {c.email}
                  {c.website && ` · ${c.website}`} · {when.format(c.createdAt)} · on <Link href={`/admin/blog/${c.post.id}`}>{c.post.title}</Link>
                </span>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: 'var(--space-2)' }}>{c.text}</p>
              </div>
              <StatusBadge status={c.approved ? 'PUBLISHED' : 'NEW'} label={c.approved ? 'Approved' : 'Waiting'} />
              <form action={setCommentApproved.bind(null, c.id, !c.approved)}>
                <ConfirmButton size="sm" variant={c.approved ? 'secondary' : 'primary'}>{c.approved ? 'Hide' : 'Approve'}</ConfirmButton>
              </form>
              <form action={deleteComment.bind(null, c.id)}>
                <ConfirmButton size="sm" variant="danger" confirm="Delete this comment for good?">Delete</ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
