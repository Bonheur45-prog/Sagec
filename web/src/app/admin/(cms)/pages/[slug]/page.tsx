import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageEditor } from '@/components/admin/PageEditor/PageEditor';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { VersionHistory } from '@/components/admin/VersionHistory/VersionHistory';
import { requireUser } from '@/lib/auth/session';
import { getEditorState, listVersions, pageKey } from '@/lib/cms/drafts';
import { noticeFrom } from '@/lib/cms/notices';
import { PAGE_INFO, isPageSlug, mediaFieldPaths, pageSchema } from '@/lib/pages/schema';
import { pickedMedia } from '../../_collections/shared';
import { discardDoc, restoreDocVersion } from '../../doc-actions';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: isPageSlug(slug) ? `${PAGE_INFO[slug].title} page` : 'Pages' };
}

/** Collects the media ids used anywhere in the page (for the previews). */
function mediaIds(doc: unknown, paths: string[][]): string[] {
  const out: string[] = [];
  const visit = (node: unknown, path: string[]) => {
    if (Array.isArray(node)) return node.forEach((n) => visit(n, path));
    if (!node || typeof node !== 'object') return;
    const [head, ...rest] = path;
    const v = (node as Record<string, unknown>)[head];
    if (!rest.length) {
      if (typeof v === 'string') out.push(v);
    } else visit(v, rest);
  };
  for (const p of paths) visit(doc, p);
  return out;
}

export default async function EditPage({ params, searchParams }: Props) {
  await requireUser();
  const { slug } = await params;
  if (!isPageSlug(slug)) notFound();
  const key = pageKey(slug);
  const [state, versions, query] = await Promise.all([getEditorState(key), listVersions(key), searchParams]);
  const media = Object.fromEntries(await pickedMedia(mediaIds(state.draft, mediaFieldPaths(slug))));
  const { notice, error } = noticeFrom(query);
  const info = PAGE_INFO[slug];

  return (
    <>
      <p>
        <Link href="/admin/pages">← All pages</Link>
      </p>
      <PageHeader
        title={`${info.title}${slug === 'seo-settings' ? '' : ' page'}`}
        description={`${info.blurb} Changes stay a draft until you publish them; earlier versions can be brought back below.`}
      />
      {info.url && (
        <p>
          <a href={info.url} target="_blank" rel="noopener">
            View the page on the website ↗
          </a>
        </p>
      )}
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      <PageEditor key={JSON.stringify(state.draft)} pageKey={key} fields={pageSchema(slug).fields} initial={state.draft} unpublished={state.hasUnpublishedChanges} media={media} />
      <VersionHistory
        versions={versions}
        restore={restoreDocVersion.bind(null, key)}
        discard={state.publishedAt ? discardDoc.bind(null, key) : undefined}
        hasUnpublishedChanges={state.hasUnpublishedChanges}
      />
    </>
  );
}
