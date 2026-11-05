import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntityForm } from '@/components/admin/EntityForm/EntityForm';
import { Fieldset } from '@/components/admin/Field/Field';
import { MediaField } from '@/components/admin/MediaPicker/MediaPicker';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { saveTestimonial } from '../../collection-actions';
import { EditorHeader, HomeCheckbox, PublishBox, TextFields, pickedMedia, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit testimonial' };

export default async function TestimonialEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const t = await prisma.testimonial.findFirst({ where: { id, deletedAt: null } });
  if (!t) notFound();
  const media = await pickedMedia([t.avatarMediaId]);
  return (
    <>
      <EditorHeader kind="testimonials" id={t.id} title={t.name} back="All testimonials" searchParams={searchParams} />
      <EntityForm
        action={saveTestimonial.bind(null, t.id)}
        aside={
          <PublishBox status={t.status} sortOrder={t.sortOrder}>
            <HomeCheckbox checked={t.showOnHome} />
          </PublishBox>
        }
      >
        <Fieldset legend="Testimonial">
          <TextFields
            values={t}
            fields={[
              { field: 'name', label: 'Name', max: 120, required: true },
              { field: 'role', label: 'Role and company', max: 160, hint: 'e.g. General Manager, Lemigo Hotel' },
              { field: 'quote', label: 'Quote', type: 'textarea', rows: 6, hint: 'Required to publish.' },
            ]}
          />
          <MediaField name="avatarMediaId" label="Photo" initial={t.avatarMediaId ? (media.get(t.avatarMediaId) ?? null) : null} hint="Optional. Empty = the person’s initials." />
        </Fieldset>
      </EntityForm>
    </>
  );
}
