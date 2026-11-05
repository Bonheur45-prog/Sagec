import type { Metadata } from 'next';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { EmptyState } from '@/components/admin/EmptyState/EmptyState';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import { deleteEntity, restoreEntity, type Kind } from '../collection-actions';
import type { Search } from '../_collections/shared';
import styles from '../_collections/shared.module.css';

export const metadata: Metadata = { title: 'Trash' };
const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Africa/Kigali' });

export default async function TrashPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const trashed = { deletedAt: { not: null } };
  const [services, projects, testimonials, partners, jobs, posts] = await Promise.all([
    prisma.service.findMany({ where: trashed, select: { id: true, title: true, deletedAt: true } }),
    prisma.project.findMany({ where: trashed, select: { id: true, title: true, deletedAt: true } }),
    prisma.testimonial.findMany({ where: trashed, select: { id: true, name: true, deletedAt: true } }),
    prisma.partner.findMany({ where: trashed, select: { id: true, name: true, deletedAt: true } }),
    prisma.job.findMany({ where: trashed, select: { id: true, title: true, deletedAt: true } }),
    prisma.post.findMany({ where: trashed, select: { id: true, title: true, deletedAt: true } }),
  ]);
  const rows: { kind: Kind; label: string; id: string; title: string; at: Date }[] = [
    ...services.map((r) => ({ kind: 'services' as const, label: 'Service', id: r.id, title: r.title, at: r.deletedAt! })),
    ...projects.map((r) => ({ kind: 'projects' as const, label: 'Project', id: r.id, title: r.title, at: r.deletedAt! })),
    ...testimonials.map((r) => ({ kind: 'testimonials' as const, label: 'Testimonial', id: r.id, title: r.name, at: r.deletedAt! })),
    ...partners.map((r) => ({ kind: 'partners' as const, label: 'Partner', id: r.id, title: r.name, at: r.deletedAt! })),
    ...jobs.map((r) => ({ kind: 'jobs' as const, label: 'Job opening', id: r.id, title: r.title, at: r.deletedAt! })),
    ...posts.map((r) => ({ kind: 'posts' as const, label: 'Article', id: r.id, title: r.title, at: r.deletedAt! })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());
  const { notice } = noticeFrom(await searchParams);

  return (
    <>
      <PageHeader title="Trash" description="Services, projects, testimonials, partners, job openings and articles you removed. Restored items come back as drafts. Photos and videos have their own trash in the Media library." />
      {notice && <Notice tone="success">{notice}</Notice>}
      {rows.length === 0 ? (
        <EmptyState title="The trash is empty." />
      ) : (
        <ul className={styles.list}>
          {rows.map((r) => (
            <li key={r.id} className={styles.row}>
              <span className={styles.title}>
                {r.title}
                <span className={styles.sub}>
                  {r.label} · removed {when.format(r.at)}
                </span>
              </span>
              <form action={restoreEntity.bind(null, r.kind, r.id)}>
                <ConfirmButton size="sm">Restore</ConfirmButton>
              </form>
              <form action={deleteEntity.bind(null, r.kind, r.id)}>
                <ConfirmButton size="sm" variant="danger" confirm={`Delete “${r.title}” for good? This cannot be undone.`}>
                  Delete for good
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
