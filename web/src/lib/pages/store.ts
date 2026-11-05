import 'server-only';
import { getPublished, pageKey } from '@/lib/cms/drafts';
import { parsePage, type PageSlug } from './schema';

export type { PageSlug } from './schema';

/** What visitors see on a page: the published texts, or SAGEC's starter text until the page is first published. */
export async function getPublishedPage(slug: PageSlug): Promise<Record<string, unknown>> {
  return (await getPublished(pageKey(slug))) ?? parsePage(slug, {});
}
