import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CField, EntityForm, MediaListField } from '@/components/admin/EntityForm/EntityForm';
import { Checkbox, Fieldset, Select, TextInput } from '@/components/admin/Field/Field';
import { MediaField } from '@/components/admin/MediaPicker/MediaPicker';
import { requireUser } from '@/lib/auth/session';
import { PROJECT_CATEGORIES } from '@/lib/cms/collections-validation';
import { prisma } from '@/lib/db';
import { saveProject } from '../../collection-actions';
import { EditorHeader, HomeCheckbox, PublishBox, SEO_FIELDS, TextFields, pickedMedia, strings, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit project' };

export default async function ProjectEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const p = await prisma.project.findFirst({ where: { id, deletedAt: null }, include: { gallery: { orderBy: { position: 'asc' } }, services: true } });
  if (!p) notFound();
  const [media, services] = await Promise.all([
    pickedMedia([p.coverMediaId, p.featuredMediaId, ...p.gallery.map((g) => g.mediaId)]),
    prisma.service.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, select: { id: true, title: true } }),
  ]);
  const used = new Set(p.services.map((s) => s.serviceId));

  return (
    <>
      <EditorHeader kind="projects" id={p.id} title={p.title} back="All projects" searchParams={searchParams} viewHref={p.status === 'PUBLISHED' ? `/projects/${p.slug}` : undefined} />
      <EntityForm
        action={saveProject.bind(null, p.id)}
        aside={
          <>
            <PublishBox status={p.status} sortOrder={p.sortOrder}>
              <HomeCheckbox checked={p.showOnHome} />
              <Checkbox name="featured" defaultChecked={p.featured} label="Featured project" hint="Shown big at the top of the Projects page. Only one at a time: this un-features the others." />
            </PublishBox>
            <Fieldset legend="Details">
              <CField name="category" label="Category" hint="Required to publish. Also the Projects page filter.">
                <Select id="category" name="category" defaultValue={p.category}>
                  <option value="">(choose)</option>
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </CField>
              <CField name="state" label="Stage">
                <Select id="state" name="state" defaultValue={p.state}>
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In progress</option>
                </Select>
              </CField>
              <CField name="progress" label="Progress (%)" hint="Only for projects in progress.">
                <TextInput id="progress" name="progress" type="number" min={0} max={99} defaultValue={p.state === 'IN_PROGRESS' ? p.progress : 0} />
              </CField>
              <TextFields
                values={p}
                fields={[
                  { field: 'year', label: 'Year', max: 20, hint: 'e.g. 2024 or 2023–2025' },
                  { field: 'location', label: 'Location', max: 120, hint: 'e.g. Kigali, Remera' },
                  { field: 'client', label: 'Client', max: 120 },
                  { field: 'area', label: 'Area', max: 60, hint: 'e.g. 12,000 m²' },
                ]}
              />
            </Fieldset>
            <Fieldset legend="Services used">
              {services.length === 0 ? (
                <p>Add services first (Services in the menu).</p>
              ) : (
                services.map((s) => <Checkbox key={s.id} name="serviceIds" value={s.id} defaultChecked={used.has(s.id)} label={s.title} />)
              )}
            </Fieldset>
          </>
        }
      >
        <Fieldset legend="Texts">
          <TextFields
            values={{ ...p, paragraphs: strings(p.paragraphs), highlights: strings(p.highlights) }}
            fields={[
              { field: 'title', label: 'Name', max: 120, required: true },
              { field: 'shortDescription', label: 'Short description', type: 'textarea', hint: 'Shown on project cards. Required to publish.' },
              { field: 'paragraphs', label: 'Full description', type: 'lines', rows: 8, hint: 'Each line becomes a paragraph on the project page.' },
              { field: 'highlights', label: 'Key facts', type: 'lines', hint: 'Optional, e.g. 8 floors, LEED-ready…' },
            ]}
          />
        </Fieldset>
        <Fieldset legend="Photos">
          <MediaField name="coverMediaId" label="Cover photo" initial={p.coverMediaId ? (media.get(p.coverMediaId) ?? null) : null} hint="Shown on cards. Required to publish." />
          <MediaField name="featuredMediaId" label="Wide photo for the project page" initial={p.featuredMediaId ? (media.get(p.featuredMediaId) ?? null) : null} hint="Optional. Empty = the cover photo." />
          <MediaListField name="gallery" label="Gallery" initial={p.gallery.map((g) => media.get(g.mediaId)).filter((m) => !!m)} max={40} />
        </Fieldset>
        <Fieldset legend="Search engines">
          <TextFields values={p} fields={SEO_FIELDS} />
        </Fieldset>
        <Fieldset legend="Address">
          <CField name="slug" label="Page address" hint="Changing it keeps old links working (they are redirected).">
            <TextInput id="slug" name="slug" defaultValue={p.slug} maxLength={80} />
          </CField>
        </Fieldset>
      </EntityForm>
    </>
  );
}
