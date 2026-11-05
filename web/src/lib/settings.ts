import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Minimal settings the CMS frame needs (the full Site settings are read by the public site in Phase 6). */
export const getSiteSettings = cache(async (): Promise<{ businessName: string }> => {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { companyName: true } });
    return { businessName: row?.companyName || 'SAGEC Ltd' };
  } catch {
    return { businessName: 'SAGEC Ltd' };
  }
});
