'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { audit } from '@/lib/audit';
import { requireUser } from '@/lib/auth/session';
import { validateJob, validatePartner, validateProject, validateService, validateTestimonial } from '@/lib/cms/collections-validation';
import { refreshPublicSite } from '@/lib/cms/revalidate';
import { inputFrom, type Errors } from '@/lib/cms/settings-validation';
import { slugify, uniqueSlug } from '@/lib/cms/slug';
import { prisma } from '@/lib/db';

// Create / save / trash / restore / delete for services, projects, testimonials, partners and job openings.
// Every change refreshes the public site; slug renames leave a redirect behind so old links keep working.

export type Kind = 'services' | 'projects' | 'testimonials' | 'partners' | 'jobs';
export type EntityFormState = { status: 'idle' } | { status: 'saved'; savedAt: number } | { status: 'error'; message: string; errors: Errors };

const KINDS: Kind[] = ['services', 'projects', 'testimonials', 'partners', 'jobs'];
const ID = /^[a-z0-9]{10,40}$/;
const fail = (errors: Errors, message = 'Some fields need attention.'): EntityFormState => ({ status: 'error', message, errors });
/** Public addresses of the collections that have their own pages. */
const PUBLIC_PATH = { services: '/services', projects: '/projects' } as const;

function done(kind: Kind): EntityFormState {
  refreshPublicSite();
  revalidatePath(`/admin/${kind}`, 'layout');
  return { status: 'saved', savedAt: Date.now() };
}

/** Media ids that still exist (a file may have been deleted in another tab). */
async function existing(ids: (string | null)[]): Promise<Set<string>> {
  const list = ids.filter((v): v is string => !!v);
  if (!list.length) return new Set();
  const rows = await prisma.mediaAsset.findMany({ where: { id: { in: list }, deletedAt: null }, select: { id: true } });
  return new Set(rows.map((r) => r.id));
}

/** Old address → new address after a slug rename. Chains are flattened; a redirect never points at itself. */
async function renameRedirect(tx: Prisma.TransactionClient, base: string, oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return;
  const from = `${base}/${oldSlug}`;
  const to = `${base}/${newSlug}`;
  await tx.redirect.deleteMany({ where: { fromPath: to } });
  await tx.redirect.updateMany({ where: { toPath: from }, data: { toPath: to } });
  await tx.redirect.upsert({ where: { fromPath: from }, update: { toPath: to, permanent: true }, create: { fromPath: from, toPath: to } });
}

// ───────── Create (name only, then the editor opens) ─────────

async function nextOrder(kind: Kind): Promise<number> {
  const agg =
    kind === 'services'
      ? await prisma.service.aggregate({ _max: { sortOrder: true } })
      : kind === 'projects'
        ? await prisma.project.aggregate({ _max: { sortOrder: true } })
        : kind === 'testimonials'
          ? await prisma.testimonial.aggregate({ _max: { sortOrder: true } })
          : kind === 'partners'
            ? await prisma.partner.aggregate({ _max: { sortOrder: true } })
            : await prisma.job.aggregate({ _max: { sortOrder: true } });
  return (agg._max.sortOrder ?? 0) + 10;
}

export async function createEntity(kind: Kind, formData: FormData) {
  const user = await requireUser();
  if (!KINDS.includes(kind)) redirect('/admin');
  const name = String(formData.get('name') ?? '').trim().slice(0, 120);
  if (!name) redirect(`/admin/${kind}?error=missing-title`);
  const sortOrder = await nextOrder(kind);
  let id: string;
  if (kind === 'services') {
    const slug = await uniqueSlug(slugify(name), async (s) => !!(await prisma.service.findUnique({ where: { slug: s }, select: { id: true } })));
    id = (await prisma.service.create({ data: { slug, title: name, sortOrder } })).id;
  } else if (kind === 'projects') {
    const slug = await uniqueSlug(slugify(name), async (s) => !!(await prisma.project.findUnique({ where: { slug: s }, select: { id: true } })));
    id = (await prisma.project.create({ data: { slug, title: name, sortOrder } })).id;
  } else if (kind === 'testimonials') {
    id = (await prisma.testimonial.create({ data: { name, sortOrder } })).id;
  } else if (kind === 'partners') {
    id = (await prisma.partner.create({ data: { name, sortOrder } })).id;
  } else {
    id = (await prisma.job.create({ data: { title: name, sortOrder } })).id;
  }
  await audit(user.id, `${kind}.create`, kind, id, { name });
  redirect(`/admin/${kind}/${id}?notice=created`);
}

// ───────── Save ─────────

export async function saveService(id: string, _s: EntityFormState, formData: FormData): Promise<EntityFormState> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.service.findUnique({ where: { id }, select: { slug: true, deletedAt: true } }) : null;
  if (!current || current.deletedAt) return fail({}, 'This service no longer exists or is in the trash.');
  const r = validateService(inputFrom(formData));
  if (!r.ok) return fail(r.errors);
  const d = r.data;
  if (await prisma.service.findFirst({ where: { slug: d.slug, id: { not: id } }, select: { id: true } })) return fail({ slug: 'Another service already uses this address.' });
  const ok = await existing([d.coverMediaId, d.detailMediaId]);
  if (d.coverMediaId && !ok.has(d.coverMediaId)) d.coverMediaId = null;
  if (d.detailMediaId && !ok.has(d.detailMediaId)) d.detailMediaId = null;
  await prisma.$transaction(async (tx) => {
    await tx.service.update({ where: { id }, data: d });
    await renameRedirect(tx, PUBLIC_PATH.services, current.slug, d.slug);
  });
  await audit(user.id, 'services.save', 'services', id, { status: d.status });
  return done('services');
}

export async function saveProject(id: string, _s: EntityFormState, formData: FormData): Promise<EntityFormState> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.project.findUnique({ where: { id }, select: { slug: true, deletedAt: true } }) : null;
  if (!current || current.deletedAt) return fail({}, 'This project no longer exists or is in the trash.');
  const r = validateProject(inputFrom(formData));
  if (!r.ok) return fail(r.errors);
  const { gallery, serviceIds, ...d } = r.data;
  if (await prisma.project.findFirst({ where: { slug: d.slug, id: { not: id } }, select: { id: true } })) return fail({ slug: 'Another project already uses this address.' });
  const ok = await existing([d.coverMediaId, d.featuredMediaId, ...gallery]);
  if (d.coverMediaId && !ok.has(d.coverMediaId)) d.coverMediaId = null;
  if (d.featuredMediaId && !ok.has(d.featuredMediaId)) d.featuredMediaId = null;
  const photos = gallery.filter((g) => ok.has(g));
  const services = serviceIds.length ? (await prisma.service.findMany({ where: { id: { in: serviceIds }, deletedAt: null }, select: { id: true } })).map((s) => s.id) : [];
  await prisma.$transaction(async (tx) => {
    // Only one project is featured at a time: featuring this one un-features the others.
    if (d.featured) await tx.project.updateMany({ where: { featured: true, id: { not: id } }, data: { featured: false } });
    await tx.project.update({ where: { id }, data: d });
    await tx.projectMedia.deleteMany({ where: { projectId: id } });
    if (photos.length) await tx.projectMedia.createMany({ data: photos.map((mediaId, position) => ({ projectId: id, mediaId, position })) });
    await tx.projectService.deleteMany({ where: { projectId: id } });
    if (services.length) await tx.projectService.createMany({ data: services.map((serviceId) => ({ projectId: id, serviceId })) });
    await renameRedirect(tx, PUBLIC_PATH.projects, current.slug, d.slug);
  });
  await audit(user.id, 'projects.save', 'projects', id, { status: d.status, ...(d.featured && { featured: true }) });
  return done('projects');
}

export async function saveTestimonial(id: string, _s: EntityFormState, formData: FormData): Promise<EntityFormState> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.testimonial.findUnique({ where: { id }, select: { deletedAt: true } }) : null;
  if (!current || current.deletedAt) return fail({}, 'This testimonial no longer exists or is in the trash.');
  const r = validateTestimonial(inputFrom(formData));
  if (!r.ok) return fail(r.errors);
  if (r.data.avatarMediaId && !(await existing([r.data.avatarMediaId])).has(r.data.avatarMediaId)) r.data.avatarMediaId = null;
  await prisma.testimonial.update({ where: { id }, data: r.data });
  await audit(user.id, 'testimonials.save', 'testimonials', id, { status: r.data.status });
  return done('testimonials');
}

export async function savePartner(id: string, _s: EntityFormState, formData: FormData): Promise<EntityFormState> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.partner.findUnique({ where: { id }, select: { deletedAt: true } }) : null;
  if (!current || current.deletedAt) return fail({}, 'This partner no longer exists or is in the trash.');
  const r = validatePartner(inputFrom(formData));
  if (!r.ok) return fail(r.errors);
  if (r.data.logoMediaId && !(await existing([r.data.logoMediaId])).has(r.data.logoMediaId)) r.data.logoMediaId = null;
  await prisma.partner.update({ where: { id }, data: r.data });
  await audit(user.id, 'partners.save', 'partners', id, { status: r.data.status });
  return done('partners');
}

export async function saveJob(id: string, _s: EntityFormState, formData: FormData): Promise<EntityFormState> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.job.findUnique({ where: { id }, select: { deletedAt: true } }) : null;
  if (!current || current.deletedAt) return fail({}, 'This job opening no longer exists or is in the trash.');
  const r = validateJob(inputFrom(formData));
  if (!r.ok) return fail(r.errors);
  await prisma.job.update({ where: { id }, data: r.data });
  await audit(user.id, 'jobs.save', 'jobs', id, { status: r.data.status === 'PUBLISHED' ? 'open' : 'closed' });
  return done('jobs');
}

// ───────── Trash ─────────

function model(kind: Kind) {
  // The models share id + status + deletedAt, which is all the trash needs.
  const m = { services: prisma.service, projects: prisma.project, testimonials: prisma.testimonial, partners: prisma.partner, jobs: prisma.job }[kind];
  return m as unknown as {
    updateMany(args: { where: { id: string }; data: { deletedAt: Date | null; status?: 'DRAFT'; featured?: false } }): Promise<unknown>;
    deleteMany(args: { where: { id: string; deletedAt: { not: null } } }): Promise<{ count: number }>;
  };
}

export async function trashEntity(kind: Kind, id: string) {
  const user = await requireUser();
  if (!KINDS.includes(kind) || !ID.test(id)) redirect('/admin');
  // A trashed project stops being the featured one.
  await model(kind).updateMany({ where: { id }, data: { deletedAt: new Date(), ...(kind === 'projects' && { featured: false as const }) } });
  await audit(user.id, `${kind}.trash`, kind, id);
  refreshPublicSite();
  redirect(`/admin/${kind}?notice=trashed`);
}

export async function restoreEntity(kind: Kind, id: string) {
  const user = await requireUser();
  if (!KINDS.includes(kind) || !ID.test(id)) redirect('/admin');
  await model(kind).updateMany({ where: { id }, data: { deletedAt: null, status: 'DRAFT' } });
  await audit(user.id, `${kind}.restore`, kind, id);
  redirect('/admin/trash?notice=restored');
}

/** Deletes for good (only from the trash). Photos stay in the media library. */
export async function deleteEntity(kind: Kind, id: string) {
  const user = await requireUser();
  if (!KINDS.includes(kind) || !ID.test(id)) redirect('/admin');
  await model(kind).deleteMany({ where: { id, deletedAt: { not: null } } });
  await audit(user.id, `${kind}.delete`, kind, id);
  redirect('/admin/trash?notice=deleted-entity');
}
