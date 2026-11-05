import 'server-only';
import { cache } from 'react';

/**
 * Minimal settings the CMS frame needs. Phase 2 replaces this with the full Site Settings
 * (company, contact, logos, SEO, Google Analytics…) stored in the database.
 */
export const getSiteSettings = cache(async (): Promise<{ businessName: string }> => {
  return { businessName: 'SAGEC Ltd' };
});
