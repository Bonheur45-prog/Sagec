/*
 * One-off: turns the old Payload page configs (cms/src/globals/*.ts) into src/lib/pages/schemas.json,
 * which drives the CMS page-text editor. Run from web/: npx tsx scripts/gen-page-schemas.ts
 * The JSON is committed; cms/ is removed after the move, so this script is only kept as a record.
 */
import { writeFileSync } from 'node:fs';
import { AboutPage } from '../../cms/src/globals/AboutPage';
import { BlogPage } from '../../cms/src/globals/BlogPage';
import { CareersPage } from '../../cms/src/globals/CareersPage';
import { ContactPage } from '../../cms/src/globals/ContactPage';
import { HomePage } from '../../cms/src/globals/HomePage';
import { ProjectsPage } from '../../cms/src/globals/ProjectsPage';
import { SeoSettings } from '../../cms/src/globals/SeoSettings';
import { ServicesPage } from '../../cms/src/globals/ServicesPage';
import { TestimonialsPage } from '../../cms/src/globals/TestimonialsPage';

type F = Record<string, unknown>;
const KEEP = ['name', 'type', 'label', 'required', 'maxLength', 'min', 'max', 'options', 'defaultValue', 'relationTo', 'maxRows', 'minRows'];

function clean(field: F): F | F[] {
  // rows and collapsibles only arrange fields in Payload's admin: keep their fields (collapsible keeps a heading)
  if (field.type === 'row') return (field.fields as F[]).flatMap((f) => clean(f));
  const out: F = {};
  for (const k of KEEP) if (field[k] !== undefined) out[k] = field[k];
  const admin = (field.admin ?? {}) as F;
  if (typeof admin.description === 'string') out.description = admin.description;
  if (field.fields) out.fields = (field.fields as F[]).flatMap((f) => clean(f));
  if (field.type === 'collapsible') out.label = field.label;
  return out;
}

const pages = [HomePage, AboutPage, ServicesPage, ProjectsPage, TestimonialsPage, CareersPage, BlogPage, ContactPage, SeoSettings];
const out = pages.map((g) => ({
  slug: g.slug,
  label: (g.label as string) ?? g.slug,
  description: (g.admin as F | undefined)?.description ?? '',
  fields: (g.fields as unknown as F[]).flatMap((f) => clean(f)),
}));
writeFileSync('src/lib/pages/schemas.json', JSON.stringify(out, null, 1) + '\n');
console.log(out.map((p) => `${p.slug}: ${JSON.stringify(p.fields).length} bytes`).join('\n'));
