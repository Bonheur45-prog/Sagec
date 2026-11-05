import 'server-only';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

/**
 * For an address with no page: follows a redirect saved in the CMS (created when a service or project
 * address is renamed, so shared links keep working), otherwise shows the "page not found" page.
 */
export async function redirectOrNotFound(path: string): Promise<never> {
  const clean = path.replace(/\/+$/, '') || '/';
  const r = await prisma.redirect.findUnique({ where: { fromPath: clean } }).catch(() => null);
  if (r && r.toPath !== clean) {
    if (r.permanent) permanentRedirect(r.toPath);
    redirect(r.toPath);
  }
  notFound();
}
