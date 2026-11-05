import type { Metadata } from 'next';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { Field, Fieldset, TextArea, TextInput } from '@/components/admin/Field/Field';
import { MediaField } from '@/components/admin/MediaPicker/MediaPicker';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { SOCIAL_NETWORKS } from '@/lib/cms/settings-validation';
import { prisma } from '@/lib/db';
import { pickedMedia, type Search } from '../../_collections/shared';
import { deleteAuthor, saveAuthor } from '../actions';
import type { PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';

export const metadata: Metadata = { title: 'Blog authors' };

type Author = { id: string; name: string; role: string; bio: string; avatarMediaId: string | null; socials: unknown; sortOrder: number };

function AuthorFields({ a, avatar }: { a?: Author; avatar: PickedMedia | null }) {
  const p = a?.id ?? 'new';
  const socials = Object.fromEntries((Array.isArray(a?.socials) ? (a!.socials as { platform: string; url: string }[]) : []).map((s) => [s.platform, s.url]));
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))' }}>
        <Field label="Name" htmlFor={`name-${p}`} required>
          <TextInput id={`name-${p}`} name="name" defaultValue={a?.name ?? ''} maxLength={120} />
        </Field>
        <Field label="Role" htmlFor={`role-${p}`} hint="e.g. Senior Architect">
          <TextInput id={`role-${p}`} name="role" defaultValue={a?.role ?? ''} maxLength={120} />
        </Field>
        <Field label="Order" htmlFor={`order-${p}`}>
          <TextInput id={`order-${p}`} name="sortOrder" type="number" min={0} max={9999} defaultValue={a?.sortOrder ?? 0} />
        </Field>
      </div>
      <Field label="Short bio" htmlFor={`bio-${p}`} hint="Shown under the author’s articles.">
        <TextArea id={`bio-${p}`} name="bio" defaultValue={a?.bio ?? ''} rows={3} />
      </Field>
      <MediaField name="avatarMediaId" label="Photo" initial={avatar} hint="Optional. Empty = initials." />
      <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))' }}>
        {SOCIAL_NETWORKS.filter((n) => ['linkedin', 'x', 'facebook', 'instagram'].includes(n.key)).map((n) => (
          <Field key={n.key} label={n.label} htmlFor={`social-${n.key}-${p}`} hint="Optional.">
            <TextInput id={`social-${n.key}-${p}`} name={`social.${n.key}`} type="url" defaultValue={socials[n.key] ?? ''} placeholder="https://" maxLength={300} />
          </Field>
        ))}
      </div>
    </div>
  );
}

export default async function AuthorsPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const authors = await prisma.blogAuthor.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], include: { _count: { select: { posts: true } } } });
  const media = await pickedMedia(authors.map((a) => a.avatarMediaId));
  const { notice, error } = noticeFrom(await searchParams);
  return (
    <>
      <PageHeader title="Blog authors" description="People shown as the writer of an article. Articles without an author show “SAGEC Team”." back={{ href: '/admin/blog', label: 'All articles' }} />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      {authors.map((a) => (
        <details key={a.id} style={{ marginBottom: 'var(--space-3)' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
            {a.name} <span style={{ fontWeight: 400 }}>· {a.role || 'no role'} · {a._count.posts} articles</span>
          </summary>
          <form action={saveAuthor.bind(null, a.id)} style={{ display: 'grid', gap: 'var(--space-3)', padding: 'var(--space-4) 0' }}>
            <AuthorFields a={a} avatar={a.avatarMediaId ? (media.get(a.avatarMediaId) ?? null) : null} />
            <div>
              <ConfirmButton variant="primary">Save</ConfirmButton>
            </div>
          </form>
          <form action={deleteAuthor.bind(null, a.id)}>
            <ConfirmButton variant="danger" size="sm" confirm={`Remove ${a.name}? Their articles stay and show “SAGEC Team”.`}>
              Remove author
            </ConfirmButton>
          </form>
        </details>
      ))}
      <Fieldset legend="New author">
        <form action={saveAuthor.bind(null, null)} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <AuthorFields avatar={null} />
          <div>
            <ConfirmButton variant="primary">Add author</ConfirmButton>
          </div>
        </form>
      </Fieldset>
    </>
  );
}
