import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { refreshPublicSite } from '@/lib/cms/revalidate';
import { isPageSlug, pageProblems, parsePage, type PageSlug } from '@/lib/pages/schema';
import { footerProblems, headerProblems, parseFooter, parseHeader, type FooterDoc, type HeaderDoc, type Problems } from './globals-model';

/*
 * Draft → publish → version history (same rules as the BrightLink and Oak CMSs):
 * - Editors only change the DRAFT; visitors see PUBLISHED.
 * - Every publish stores a snapshot in ContentVersion, so an earlier version can be brought back.
 * Keys: "header", "footer", and "page:<slug>" for each page's texts (GlobalSection).
 */

export type PageKey = `page:${PageSlug}`;
export type DocKey = 'header' | 'footer' | PageKey;
type DocOf<K> = K extends 'header' ? HeaderDoc : K extends 'footer' ? FooterDoc : Record<string, unknown>;

export const pageKey = (slug: PageSlug): PageKey => `page:${slug}`;
export const isDocKey = (v: unknown): v is DocKey => v === 'header' || v === 'footer' || (typeof v === 'string' && v.startsWith('page:') && isPageSlug(v.slice(5)));

type Spec = { parse: (raw: unknown) => unknown; problems: (doc: never) => Problems };

function specFor(k: DocKey): Spec {
  if (k === 'header') return { parse: parseHeader, problems: headerProblems };
  if (k === 'footer') return { parse: parseFooter, problems: footerProblems };
  const slug = k.slice(5) as PageSlug;
  return { parse: (raw) => parsePage(slug, raw), problems: (doc: Record<string, unknown>) => pageProblems(slug, doc) };
}

/** Kept per document; older versions are deleted on publish. */
export const MAX_VERSIONS = 30;
const ENTITY = 'global';

const readRow = (k: DocKey) => prisma.globalSection.findUnique({ where: { key: k } });

async function write(k: DocKey, data: { draft: Prisma.InputJsonValue; published?: Prisma.InputJsonValue; publishedAt?: Date }, tx: Prisma.TransactionClient = prisma) {
  await tx.globalSection.upsert({ where: { key: k }, update: data, create: { key: k, ...data } });
}

const hasContent = (v: Prisma.JsonValue | null | undefined) => !!v && typeof v === 'object' && Object.keys(v).length > 0;

export type EditorState<K extends DocKey> = { draft: DocOf<K>; publishedAt: Date | null; hasUnpublishedChanges: boolean };

export async function getEditorState<K extends DocKey>(k: K): Promise<EditorState<K>> {
  const s = specFor(k);
  const row = await readRow(k);
  const published = hasContent(row?.published) ? s.parse(row!.published) : null;
  const draft = hasContent(row?.draft) ? s.parse(row!.draft) : (published ?? s.parse({}));
  return { draft: draft as DocOf<K>, publishedAt: row?.publishedAt ?? null, hasUnpublishedChanges: JSON.stringify(draft) !== JSON.stringify(published) };
}

/** What visitors see, or null when nothing was published yet (the site then uses its starter content). */
export async function getPublished<K extends DocKey>(k: K): Promise<DocOf<K> | null> {
  const row = await readRow(k);
  return hasContent(row?.published) ? (specFor(k).parse(row!.published) as DocOf<K>) : null;
}

export async function saveDraft<K extends DocKey>(k: K, raw: unknown): Promise<DocOf<K>> {
  const doc = specFor(k).parse(raw) as DocOf<K>;
  await write(k, { draft: doc as unknown as Prisma.InputJsonValue });
  return doc;
}

export async function publish(k: DocKey, userId: string, note?: string): Promise<{ ok: true } | { ok: false; problems: Problems }> {
  const s = specFor(k);
  const { draft } = await getEditorState(k);
  const problems = (s.problems as (d: unknown) => Problems)(draft);
  if (Object.keys(problems).length) return { ok: false, problems };
  const json = draft as unknown as Prisma.InputJsonValue;
  await prisma.$transaction(async (tx) => {
    await write(k, { draft: json, published: json, publishedAt: new Date() }, tx);
    await tx.contentVersion.create({ data: { entityType: ENTITY, entityKey: k, snapshot: json, note: note?.trim().slice(0, 200) || null, createdById: userId } });
    const old = await tx.contentVersion.findMany({ where: { entityType: ENTITY, entityKey: k }, orderBy: { createdAt: 'desc' }, skip: MAX_VERSIONS, select: { id: true } });
    if (old.length) await tx.contentVersion.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
  });
  refreshPublicSite();
  return { ok: true };
}

/** Throws away unpublished changes: the draft becomes what is live again. */
export async function discardDraft(k: DocKey) {
  const row = await readRow(k);
  await write(k, { draft: (row?.published ?? {}) as Prisma.InputJsonValue });
}

export type VersionRow = { id: string; createdAt: Date; note: string | null; by: string | null };

export async function listVersions(k: DocKey): Promise<VersionRow[]> {
  const rows = await prisma.contentVersion.findMany({ where: { entityType: ENTITY, entityKey: k }, orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true, note: true, createdById: true } });
  const ids = rows.map((r) => r.createdById).filter((v): v is string => !!v);
  const users = ids.length ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : [];
  return rows.map((r) => ({ id: r.id, createdAt: r.createdAt, note: r.note, by: users.find((u) => u.id === r.createdById)?.name ?? null }));
}

/** Copies a published version into the draft. Nothing changes on the site until the next publish. */
export async function restoreVersion(k: DocKey, versionId: string): Promise<boolean> {
  const v = await prisma.contentVersion.findFirst({ where: { id: versionId, entityType: ENTITY, entityKey: k } });
  if (!v) return false;
  await saveDraft(k, v.snapshot);
  return true;
}
