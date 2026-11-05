import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { CollectionList, pickedMedia, type Search } from '../_collections/shared';

export const metadata: Metadata = { title: 'Testimonials' };

export default async function TestimonialsPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const rows = await prisma.testimonial.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  const thumbs = await pickedMedia(rows.map((r) => r.avatarMediaId));
  return (
    <CollectionList
      kind="testimonials"
      title="Testimonials"
      description="What clients say about SAGEC. Only publish real quotes from people who agreed to be quoted."
      createLabel="Name of the person quoted"
      searchParams={searchParams}
      rows={rows.map((r) => ({
        id: r.id,
        title: r.name,
        sub: r.role,
        status: r.status,
        thumb: r.avatarMediaId ? (thumbs.get(r.avatarMediaId) ?? null) : null,
      }))}
    />
  );
}
