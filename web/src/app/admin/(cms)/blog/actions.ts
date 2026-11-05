'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { audit } from '@/lib/audit';
import { requireUser } from '@/lib/auth/session';
import { mediaInfoMap } from '@/lib/blog/media';
import { validatePost } from '@/lib/blog/post-model';
import { imageIdsIn, renderDoc } from '@/lib/blog/render';
import { refreshPublicSite } from '@/lib/cms/revalidate';
import { inputFrom, SOCIAL_NETWORKS, type Errors } from '@/lib/cms/settings-validation';
import { isValidSlug, slugify, uniqueSlug } from '@/lib/cms/slug';
import { prisma } from '@/lib/db';

const ID = /^[a-z0-9]{10,40}$/;
export type PostSaveResult = { ok: true; savedAt: number; slug: string; status: 'DRAFT' | 'PUBLISHED'; publishedAt: string | null } | { ok: false; message: string; errors: Errors };

/** The categories the current SAGEC blog uses (cms/src/collections/BlogPosts.ts). */
const STARTER_CATEGORIES = ['Construction', 'Architecture', 'Engineering', 'Interior Design', 'Sustainability', 'Projects', 'Company News', 'News'];

export async function createPost(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get('name') ?? '').trim().slice(0, 160);
  if (!title) redirect('/admin/blog?error=missing-title');
  const category = await prisma.blogCategory.findFirst({ orderBy: { sortOrder: 'asc' }, select: { id: true } });
  if (!category) redirect('/admin/blog/categories?error=no-category');
  const slug = await uniqueSlug(slugify(title), async (s) => !!(await prisma.post.findUnique({ where: { slug: s }, select: { id: true } })));
  const post = await prisma.post.create({ data: { slug, title, categoryId: category.id, doc: { type: 'doc', content: [] } } });
  await audit(user.id, 'posts.create', 'posts', post.id, { title });
  redirect(`/admin/blog/${post.id}?notice=created`);
}

/** Saves the whole article. The HTML visitors get is rendered here, from the editor's document. */
export async function savePost(id: string, raw: unknown): Promise<PostSaveResult> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.post.findUnique({ where: { id }, select: { slug: true, deletedAt: true, publishedAt: true } }) : null;
  if (!current || current.deletedAt) return { ok: false, message: 'This article no longer exists or is in the trash.', errors: {} };
  const r = validatePost(raw);
  if (!r.ok) return { ok: false, message: 'Some fields need attention.', errors: r.errors };
  const d = r.data;
  const errors: Errors = {};
  if (await prisma.post.findFirst({ where: { slug: d.slug, id: { not: id } }, select: { id: true } })) errors.slug = 'Another article already uses this address.';
  if (!(await prisma.blogCategory.findUnique({ where: { id: d.categoryId }, select: { id: true } }))) errors.categoryId = 'Choose a category.';
  if (d.authorId && !(await prisma.blogAuthor.findUnique({ where: { id: d.authorId }, select: { id: true } }))) d.authorId = null;

  const ids = imageIdsIn(d.doc);
  const media = await mediaInfoMap(ids);
  const rendered = renderDoc(d.doc, media);
  if (d.status === 'PUBLISHED') {
    const missing = ids.filter((m) => !media.get(m)?.alt);
    if (ids.some((m) => !media.has(m))) errors.doc = 'A photo in the article was deleted from the media library. Remove it or choose another.';
    else if (missing.length) errors.doc = `${missing.length} photo(s) in the article have no description. Add it in the Media library before publishing.`;
  }
  if (Object.keys(errors).length) return { ok: false, message: 'Some fields need attention.', errors };

  // First publish without a chosen date = now. A chosen future date = scheduled.
  const publishedAt = d.publishedAt ? new Date(d.publishedAt) : d.status === 'PUBLISHED' ? (current.publishedAt ?? new Date()) : current.publishedAt;
  const { publishedAt: _p, doc, ...base } = d;
  await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id },
      data: { ...base, doc: doc as object, html: rendered.html, toc: rendered.toc, fonts: rendered.fonts, readingMinutes: rendered.readingMinutes, publishedAt },
    });
    if (current.slug !== d.slug) {
      const from = `/blog/${current.slug}`;
      const to = `/blog/${d.slug}`;
      await tx.redirect.deleteMany({ where: { fromPath: to } });
      await tx.redirect.updateMany({ where: { toPath: from }, data: { toPath: to } });
      await tx.redirect.upsert({ where: { fromPath: from }, update: { toPath: to }, create: { fromPath: from, toPath: to } });
    }
  });
  await audit(user.id, 'posts.save', 'posts', id, { status: d.status });
  refreshPublicSite();
  revalidatePath('/admin/blog');
  return { ok: true, savedAt: Date.now(), slug: d.slug, status: d.status, publishedAt: publishedAt?.toISOString() ?? null };
}

export async function trashPost(id: string) {
  const user = await requireUser();
  if (!ID.test(id)) redirect('/admin/blog');
  await prisma.post.updateMany({ where: { id }, data: { deletedAt: new Date(), featured: false } });
  await audit(user.id, 'posts.trash', 'posts', id);
  refreshPublicSite();
  redirect('/admin/blog?notice=trashed');
}

// ───── Categories ─────

export async function saveCategory(id: string | null, formData: FormData) {
  const user = await requireUser();
  const input = inputFrom(formData);
  const name = input.get('name').trim().slice(0, 80);
  if (!name) redirect('/admin/blog/categories?error=missing-title');
  const slug = input.get('slug').trim().toLowerCase() || slugify(name);
  if (!isValidSlug(slug)) redirect('/admin/blog/categories?error=bad-slug');
  const clash = await prisma.blogCategory.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) }, select: { id: true } });
  if (clash) redirect('/admin/blog/categories?error=slug-taken');
  const data = {
    slug,
    name,
    description: input.get('description').trim().slice(0, 400),
    metaTitle: input.get('metaTitle').trim().slice(0, 120),
    metaDescription: input.get('metaDescription').trim().slice(0, 300),
    sortOrder: Math.max(0, Math.min(9999, Number.parseInt(input.get('sortOrder'), 10) || 0)),
  };
  const before = id && ID.test(id) ? await prisma.blogCategory.findUnique({ where: { id }, select: { slug: true } }) : null;
  const cat = before ? await prisma.blogCategory.update({ where: { id: id! }, data }) : await prisma.blogCategory.create({ data });
  if (before && before.slug !== slug) {
    const from = `/blog/category/${before.slug}`;
    const to = `/blog/category/${slug}`;
    await prisma.redirect.deleteMany({ where: { fromPath: to } });
    await prisma.redirect.updateMany({ where: { toPath: from }, data: { toPath: to } });
    await prisma.redirect.upsert({ where: { fromPath: from }, update: { toPath: to }, create: { fromPath: from, toPath: to } });
  }
  await audit(user.id, before ? 'category.save' : 'category.create', 'category', cat.id);
  refreshPublicSite();
  redirect('/admin/blog/categories?notice=saved');
}

export async function deleteCategory(id: string) {
  const user = await requireUser();
  if (!ID.test(id)) redirect('/admin/blog/categories');
  if (await prisma.post.count({ where: { categoryId: id } })) redirect('/admin/blog/categories?error=not-empty');
  await prisma.blogCategory.deleteMany({ where: { id } });
  await audit(user.id, 'category.delete', 'category', id);
  refreshPublicSite();
  redirect('/admin/blog/categories?notice=deleted-category');
}

/** Adds SAGEC's blog categories (only when there are none). */
export async function addStarterCategories() {
  const user = await requireUser();
  if (await prisma.blogCategory.count()) redirect('/admin/blog/categories');
  await prisma.blogCategory.createMany({ data: STARTER_CATEGORIES.map((name, i) => ({ name, slug: slugify(name), sortOrder: (i + 1) * 10 })) });
  await audit(user.id, 'category.starter', 'category', 'all');
  redirect('/admin/blog/categories?notice=saved');
}

// ───── Authors ─────

export async function saveAuthor(id: string | null, formData: FormData) {
  const user = await requireUser();
  const input = inputFrom(formData);
  const name = input.get('name').trim().slice(0, 120);
  if (!name) redirect('/admin/blog/authors?error=bad-name');
  const avatar = input.get('avatarMediaId').trim();
  const socials: { platform: string; url: string }[] = [];
  for (const n of SOCIAL_NETWORKS) {
    const raw = input.get(`social.${n.key}`).trim();
    if (!raw) continue;
    try {
      const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (n.host.test(u.hostname.replace(/^www\./, ''))) socials.push({ platform: n.key, url: u.toString() });
    } catch {
      /* ignored: only valid links to the right site are kept */
    }
  }
  const data = {
    name,
    role: input.get('role').trim().slice(0, 120),
    bio: input.get('bio').trim().slice(0, 1000),
    avatarMediaId: ID.test(avatar) && (await prisma.mediaAsset.findFirst({ where: { id: avatar, deletedAt: null }, select: { id: true } })) ? avatar : null,
    socials,
    sortOrder: Math.max(0, Math.min(9999, Number.parseInt(input.get('sortOrder'), 10) || 0)),
  };
  const exists = id && ID.test(id) ? await prisma.blogAuthor.findUnique({ where: { id }, select: { id: true } }) : null;
  const author = exists ? await prisma.blogAuthor.update({ where: { id: id! }, data }) : await prisma.blogAuthor.create({ data });
  await audit(user.id, exists ? 'author.save' : 'author.create', 'author', author.id);
  refreshPublicSite();
  redirect('/admin/blog/authors?notice=saved');
}

/** Removes an author; their articles stay and show "SAGEC Team". */
export async function deleteAuthor(id: string) {
  const user = await requireUser();
  if (!ID.test(id)) redirect('/admin/blog/authors');
  await prisma.blogAuthor.deleteMany({ where: { id } });
  await audit(user.id, 'author.delete', 'author', id);
  refreshPublicSite();
  redirect('/admin/blog/authors?notice=deleted-author');
}

// ───── Comments ─────

export async function setCommentApproved(id: string, approved: boolean) {
  const user = await requireUser();
  if (!ID.test(id)) redirect('/admin/comments');
  await prisma.blogComment.updateMany({ where: { id }, data: { approved } });
  await audit(user.id, approved ? 'comment.approve' : 'comment.hide', 'comment', id);
  refreshPublicSite();
  redirect(`/admin/comments?notice=${approved ? 'comment-approved' : 'comment-hidden'}`);
}

export async function deleteComment(id: string) {
  const user = await requireUser();
  if (!ID.test(id)) redirect('/admin/comments');
  await prisma.blogComment.deleteMany({ where: { id } });
  await audit(user.id, 'comment.delete', 'comment', id);
  refreshPublicSite();
  redirect('/admin/comments?notice=comment-deleted');
}
