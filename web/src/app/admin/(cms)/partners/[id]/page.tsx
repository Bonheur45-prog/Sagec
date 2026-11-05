import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CField, EntityForm } from '@/components/admin/EntityForm/EntityForm';
import { Fieldset, TextInput } from '@/components/admin/Field/Field';
import { MediaField } from '@/components/admin/MediaPicker/MediaPicker';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { savePartner } from '../../collection-actions';
import { EditorHeader, PublishBox, pickedMedia, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit partner' };

export default async function PartnerEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const c = await prisma.partner.findFirst({ where: { id, deletedAt: null } });
  if (!c) notFound();
  const media = await pickedMedia([c.logoMediaId]);
  return (
    <>
      <EditorHeader kind="partners" id={c.id} title={c.name} back="All partners" searchParams={searchParams} />
      <EntityForm action={savePartner.bind(null, c.id)} aside={<PublishBox status={c.status} sortOrder={c.sortOrder} />}>
        <Fieldset legend="Partner">
          <CField name="name" label="Name" required>
            <TextInput id="name" name="name" defaultValue={c.name} maxLength={120} />
          </CField>
          <CField name="website" label="Website" hint="Optional. The logo links here.">
            <TextInput id="website" name="website" type="url" defaultValue={c.website} maxLength={300} placeholder="https://" />
          </CField>
          <MediaField name="logoMediaId" label="Logo" initial={c.logoMediaId ? (media.get(c.logoMediaId) ?? null) : null} hint="Required to publish. A transparent PNG looks best." />
        </Fieldset>
      </EntityForm>
    </>
  );
}
