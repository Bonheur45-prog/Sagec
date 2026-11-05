import 'server-only';
import { revalidatePath } from 'next/cache';

/**
 * Makes the public website show a change right away instead of after its refresh window.
 * The whole public site is refreshed: it is small, and one item appears on many pages.
 * (Phase 6 adds the tagged data cache for the public pages and refreshes it here too.)
 */
export function refreshPublicSite() {
  revalidatePath('/', 'layout');
}
