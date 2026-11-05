import 'server-only';
import { dehydrate, QueryClient, type DehydratedState } from '@tanstack/react-query';
import { isPageSlug } from '@/lib/pages/schema';
import { companyInfo, pageGlobal, payloadGet } from './payload';

/*
 * The site's sections read their content through React Query (the same keys as before, e.g.
 * ['home-page'], ['services', slug]). The server fills those keys before the page is sent, so every
 * page arrives complete: visitors and search engines see the content without waiting for any loading.
 */

export type Key = readonly [string] | readonly [string, string];

type Docs = { docs: unknown[] };
const list = async (collection: string, params = ''): Promise<unknown[]> => ((await payloadGet([collection], new URLSearchParams(params))) as Docs).docs;
const one = async (collection: string, slug: string) => (await list(collection, `where[slug][equals]=${encodeURIComponent(slug)}`))[0] ?? null;

/** The data for one query key, exactly as the matching hook in src/site/hooks returns it. */
export async function loadKey(key: Key): Promise<unknown> {
  const [name, arg] = key;
  if (name === 'company-info') return companyInfo();
  if (isPageSlug(name)) return pageGlobal(name);
  if (arg !== undefined) {
    if (name === 'services' || name === 'projects' || name === 'blog-posts') return one(name, arg);
    if (name === 'blog-comments') return list('blog-comments', `where[post][equals]=${encodeURIComponent(arg)}`);
  }
  if (['services', 'projects', 'testimonials', 'partners', 'jobs', 'blog-posts', 'tags'].includes(name)) return list(name);
  throw new Error(`Unknown content key ${key.join('/')}`);
}

/** Runs the queries for a page and returns the state to hand to <HydrationBoundary>. */
export async function prefetch(keys: Key[], client = new QueryClient()): Promise<{ state: DehydratedState; data: Map<string, unknown> }> {
  const data = new Map<string, unknown>();
  await Promise.all(
    keys.map(async (key) => {
      try {
        const value = await loadKey(key);
        data.set(key.join('/'), value);
        client.setQueryData([...key], value);
      } catch (error) {
        // Left out: the section shows its own loading/error state and retries in the browser.
        console.error('[site] could not load', key.join('/'), error);
      }
    }),
  );
  return { state: dehydrate(client), data };
}
