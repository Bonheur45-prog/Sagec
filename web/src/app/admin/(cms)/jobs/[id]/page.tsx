import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CField, EntityForm } from '@/components/admin/EntityForm/EntityForm';
import { Fieldset, Select } from '@/components/admin/Field/Field';
import { requireUser } from '@/lib/auth/session';
import { JOB_DEPARTMENTS, JOB_TYPES } from '@/lib/cms/collections-validation';
import { prisma } from '@/lib/db';
import { saveJob } from '../../collection-actions';
import { EditorHeader, PublishBox, TextFields, strings, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit job opening' };

export default async function JobEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const j = await prisma.job.findFirst({ where: { id, deletedAt: null } });
  if (!j) notFound();
  return (
    <>
      <EditorHeader kind="jobs" id={j.id} title={j.title} back="All job openings" searchParams={searchParams} viewHref={j.status === 'PUBLISHED' ? '/careers' : undefined} />
      <EntityForm
        action={saveJob.bind(null, j.id)}
        aside={
          <>
            <PublishBox status={j.status} sortOrder={j.sortOrder} words={{ published: 'Open', draft: 'Closed' }} />
            <Fieldset legend="Role">
              <CField name="department" label="Department" hint="Required to open the role.">
                <Select id="department" name="department" defaultValue={j.department}>
                  <option value="">(choose)</option>
                  {JOB_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </CField>
              <CField name="type" label="Job type">
                <Select id="type" name="type" defaultValue={j.type}>
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </CField>
            </Fieldset>
          </>
        }
      >
        <Fieldset legend="Job">
          <TextFields
            values={{ ...j, requirements: strings(j.requirements) }}
            fields={[
              { field: 'title', label: 'Job title', max: 150, required: true },
              { field: 'location', label: 'Location', max: 120, required: true },
              { field: 'description', label: 'About the role', type: 'textarea', rows: 6, hint: 'Required to open the role.' },
              { field: 'requirements', label: 'Requirements', type: 'lines', rows: 6 },
            ]}
          />
        </Fieldset>
        <Fieldset legend="How to apply" description="Leave both empty to use the default email from Careers settings (or the public email in Site settings).">
          <TextFields
            values={j}
            fields={[
              { field: 'applyEmail', label: 'Apply email', max: 200 },
              { field: 'applyLink', label: 'Apply online link', max: 500, hint: 'Optional, e.g. a Google Form.' },
            ]}
          />
        </Fieldset>
      </EntityForm>
    </>
  );
}
