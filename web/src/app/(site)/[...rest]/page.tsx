import { redirectOrNotFound } from '@/lib/site/redirects';

// Any other address: a saved redirect (CMS) if there is one, otherwise "page not found".
export const dynamic = 'force-dynamic';

export default async function CatchAll({ params }: { params: Promise<{ rest: string[] }> }) {
  const { rest } = await params;
  return redirectOrNotFound(`/${rest.join('/')}`);
}
