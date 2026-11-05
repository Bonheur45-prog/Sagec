import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { CollectionList, type Search } from '../_collections/shared';

export const metadata: Metadata = { title: 'Job openings' };

export default async function JobsPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const rows = await prisma.job.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  return (
    <CollectionList
      kind="jobs"
      title="Job openings"
      description="Roles on the Careers page. Set a role to Closed when it is filled: it leaves the website but stays here to reopen later."
      createLabel="Title of a new role, e.g. Site Engineer"
      searchParams={searchParams}
      words={{ published: 'Open', draft: 'Closed' }}
      rows={rows.map((r) => ({ id: r.id, title: r.title, sub: [r.department, r.type, r.location].filter(Boolean).join(' · '), status: r.status }))}
    />
  );
}
