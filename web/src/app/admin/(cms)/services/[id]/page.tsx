import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CField, EntityForm } from '@/components/admin/EntityForm/EntityForm';
import { Fieldset, Select, TextInput } from '@/components/admin/Field/Field';
import { MediaField } from '@/components/admin/MediaPicker/MediaPicker';
import { requireUser } from '@/lib/auth/session';
import { SERVICE_ICONS } from '@/lib/cms/collections-validation';
import { prisma } from '@/lib/db';
import { saveService } from '../../collection-actions';
import { EditorHeader, HomeCheckbox, PublishBox, SEO_FIELDS, TextFields, pickedMedia, strings, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit service' };

export default async function ServiceEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const s = await prisma.service.findFirst({ where: { id, deletedAt: null } });
  if (!s) notFound();
  const media = await pickedMedia([s.coverMediaId, s.detailMediaId]);

  return (
    <>
      <EditorHeader kind="services" id={s.id} title={s.title} back="All services" searchParams={searchParams} viewHref={s.status === 'PUBLISHED' ? `/services/${s.slug}` : undefined} />
      <EntityForm
        action={saveService.bind(null, s.id)}
        aside={
          <>
            <PublishBox status={s.status} sortOrder={s.sortOrder}>
              <HomeCheckbox checked={s.showOnHome} />
            </PublishBox>
            <Fieldset legend="Icon">
              <CField name="icon" label="Icon on cards">
                <Select id="icon" name="icon" defaultValue={s.icon}>
                  <option value="">(none)</option>
                  {SERVICE_ICONS.map((i) => (
                    <option key={i.key} value={i.key}>{i.label}</option>
                  ))}
                </Select>
              </CField>
            </Fieldset>
          </>
        }
      >
        <Fieldset legend="Texts">
          <TextFields
            values={{ ...s, deliverables: strings(s.deliverables) }}
            fields={[
              { field: 'title', label: 'Name', max: 120, required: true },
              { field: 'shortDescription', label: 'Short description', type: 'textarea', hint: 'Shown on cards and at the top of the service page. Required to publish.' },
              { field: 'deliverables', label: 'What SAGEC delivers', type: 'lines', hint: 'e.g. Concept design, Building permits…' },
            ]}
          />
        </Fieldset>
        <Fieldset legend="Photos">
          <MediaField name="coverMediaId" label="Card photo" initial={s.coverMediaId ? (media.get(s.coverMediaId) ?? null) : null} hint="Required to publish." />
          <MediaField name="detailMediaId" label="Large photo on the service page" initial={s.detailMediaId ? (media.get(s.detailMediaId) ?? null) : null} hint="Optional. Empty = the card photo." />
        </Fieldset>
        <Fieldset legend="Search engines">
          <TextFields values={s} fields={SEO_FIELDS} />
        </Fieldset>
        <Fieldset legend="Address">
          <CField name="slug" label="Page address" hint="Changing it keeps old links working (they are redirected).">
            <TextInput id="slug" name="slug" defaultValue={s.slug} maxLength={80} />
          </CField>
        </Fieldset>
      </EntityForm>
    </>
  );
}
