import { GlobalEditor } from '@/components/admin/GlobalEditor/GlobalEditor';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { VersionHistory } from '@/components/admin/VersionHistory/VersionHistory';
import { requireUser } from '@/lib/auth/session';
import { getEditorState, listVersions } from '@/lib/cms/drafts';
import { noticeFrom } from '@/lib/cms/notices';
import { SITE_PAGES, type FooterDoc, type HeaderDoc } from '@/lib/cms/globals-model';
import { discardDoc, restoreDocVersion } from './doc-actions';

/** Shared screen for the header and footer editors. */
export async function DocEditorPage({ kind, searchParams }: { kind: 'header' | 'footer'; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser();
  const [state, versions, query] = await Promise.all([getEditorState(kind), listVersions(kind), searchParams]);
  const { notice, error } = noticeFrom(query);
  // TODO(Phase 3): add each service and project page to the suggestions.
  const pages = SITE_PAGES;
  const title = kind === 'header' ? 'Header' : 'Footer';

  return (
    <>
      <PageHeader
        title={title}
        description={`Shown on every page. Changes stay a draft until you publish them; earlier versions can be brought back below.`}
      />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      {kind === 'header' ? (
        <GlobalEditor key={JSON.stringify(state.draft)} kind="header" initial={state.draft as HeaderDoc} unpublished={state.hasUnpublishedChanges} pages={pages} />
      ) : (
        <GlobalEditor key={JSON.stringify(state.draft)} kind="footer" initial={state.draft as FooterDoc} unpublished={state.hasUnpublishedChanges} pages={pages} />
      )}
      <VersionHistory
        versions={versions}
        restore={restoreDocVersion.bind(null, kind)}
        discard={state.publishedAt ? discardDoc.bind(null, kind) : undefined}
        hasUnpublishedChanges={state.hasUnpublishedChanges}
      />
    </>
  );
}
