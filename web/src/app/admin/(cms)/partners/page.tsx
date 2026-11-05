import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { CollectionList, pickedMedia, type Search } from '../_collections/shared';

export const metadata: Metadata = { title: 'Partners' };

export default async function PartnersPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const rows = await prisma.partner.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  const thumbs = await pickedMedia(rows.map((r) => r.logoMediaId));
  return (
    <CollectionList
      kind="partners"
      title="Partners"
      description="Partner and client logos shown in the strip on the home page."
      createLabel="Name of a new partner"
      searchParams={searchParams}
      rows={rows.map((r) => ({ id: r.id, title: r.name, sub: r.website, status: r.status, thumb: r.logoMediaId ? (thumbs.get(r.logoMediaId) ?? null) : null }))}
    />
  );
}
