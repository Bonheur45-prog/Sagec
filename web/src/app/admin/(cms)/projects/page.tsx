import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { CollectionList, pickedMedia, type Search } from '../_collections/shared';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const rows = await prisma.project.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  const thumbs = await pickedMedia(rows.map((r) => r.coverMediaId));
  return (
    <CollectionList
      kind="projects"
      title="Projects"
      description="SAGEC’s portfolio. The featured project is shown big at the top of the Projects page."
      createLabel="Name of a new project"
      searchParams={searchParams}
      rows={rows.map((r) => ({
        id: r.id,
        title: r.title,
        sub: [r.featured ? '★ Featured' : '', r.category, r.year, r.state === 'IN_PROGRESS' ? `In progress (${r.progress}%)` : 'Completed'].filter(Boolean).join(' · '),
        status: r.status,
        thumb: r.coverMediaId ? (thumbs.get(r.coverMediaId) ?? null) : null,
      }))}
    />
  );
}
