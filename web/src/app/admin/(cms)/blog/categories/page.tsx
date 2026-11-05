import type { Metadata } from 'next';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { Field, Fieldset, TextArea, TextInput } from '@/components/admin/Field/Field';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import type { Search } from '../../_collections/shared';
import { addStarterCategories, deleteCategory, saveCategory } from '../actions';

export const metadata: Metadata = { title: 'Blog categories' };

type Cat = { id: string; slug: string; name: string; description: string; metaTitle: string; metaDescription: string; sortOrder: number };

function CategoryFields({ c }: { c?: Cat }) {
  const p = c?.id ?? 'new';
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <Field label="Name" htmlFor={`name-${p}`} required>
        <TextInput id={`name-${p}`} name="name" defaultValue={c?.name ?? ''} maxLength={80} />
      </Field>
      <Field label="Description" htmlFor={`description-${p}`} hint="Optional. Shown on the category's page.">
        <TextArea id={`description-${p}`} name="description" defaultValue={c?.description ?? ''} rows={2} />
      </Field>
      <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))' }}>
        <Field label="Address" htmlFor={`slug-${p}`} hint="Empty = from the name.">
          <TextInput id={`slug-${p}`} name="slug" defaultValue={c?.slug ?? ''} maxLength={80} />
        </Field>
        <Field label="Order" htmlFor={`order-${p}`}>
          <TextInput id={`order-${p}`} name="sortOrder" type="number" min={0} max={9999} defaultValue={c?.sortOrder ?? 0} />
        </Field>
        <Field label="Search title" htmlFor={`metaTitle-${p}`} hint="Optional.">
          <TextInput id={`metaTitle-${p}`} name="metaTitle" defaultValue={c?.metaTitle ?? ''} maxLength={120} />
        </Field>
      </div>
      <Field label="Search description" htmlFor={`metaDescription-${p}`} hint="Optional.">
        <TextArea id={`metaDescription-${p}`} name="metaDescription" defaultValue={c?.metaDescription ?? ''} rows={2} />
      </Field>
    </div>
  );
}

export default async function CategoriesPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const cats = await prisma.blogCategory.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { posts: true } } } });
  const { notice, error } = noticeFrom(await searchParams);
  return (
    <>
      <PageHeader title="Blog categories" description="Every article belongs to one category; they are also the filter buttons on the blog." back={{ href: '/admin/blog', label: 'All articles' }} />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      {cats.length === 0 && (
        <form action={addStarterCategories} style={{ marginBottom: 'var(--space-5)' }}>
          <Notice tone="info" title="No categories yet">
            Add SAGEC’s usual categories (Construction, Architecture, Engineering, Interior Design, Sustainability, Projects, Company News, News) in one click, or create your own below.
          </Notice>
          <ConfirmButton variant="primary">Add SAGEC’s categories</ConfirmButton>
        </form>
      )}
      {cats.map((c) => (
        <details key={c.id} style={{ marginBottom: 'var(--space-3)' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
            {c.name} <span style={{ fontWeight: 400 }}>· /blog/category/{c.slug} · {c._count.posts} articles</span>
          </summary>
          <form action={saveCategory.bind(null, c.id)} style={{ display: 'grid', gap: 'var(--space-3)', padding: 'var(--space-4) 0' }}>
            <CategoryFields c={c} />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <ConfirmButton variant="primary">Save</ConfirmButton>
            </div>
          </form>
          <form action={deleteCategory.bind(null, c.id)}>
            <ConfirmButton variant="danger" size="sm" confirm={`Delete the category “${c.name}”?`} disabled={c._count.posts > 0}>
              {c._count.posts > 0 ? 'Delete (move its articles first)' : 'Delete'}
            </ConfirmButton>
          </form>
        </details>
      ))}
      <Fieldset legend="New category">
        <form action={saveCategory.bind(null, null)} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <CategoryFields />
          <div>
            <ConfirmButton variant="primary">Add category</ConfirmButton>
          </div>
        </form>
      </Fieldset>
    </>
  );
}
