import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { CollectionList, pickedMedia, type Search } from '../_collections/shared';

export const metadata: Metadata = { title: 'Services' };

export default async function ServicesPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const rows = await prisma.service.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], include: { _count: { select: { projects: true } } } });
  const thumbs = await pickedMedia(rows.map((r) => r.coverMediaId));
  return (
    <CollectionList
      kind="services"
      title="Services"
      description="What SAGEC offers. Each published service has its own page and appears on the Services page, the home page and in the footer."
      createLabel="Name of a new service"
      searchParams={searchParams}
      rows={rows.map((r) => ({
        id: r.id,
        title: r.title,
        sub: [`/services/${r.slug}`, r._count.projects ? `${r._count.projects} project${r._count.projects === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · '),
        status: r.status,
        thumb: r.coverMediaId ? (thumbs.get(r.coverMediaId) ?? null) : null,
      }))}
    />
  );
}
