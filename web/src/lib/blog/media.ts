import 'server-only';
import { prisma } from '@/lib/db';
import { buildSrcSet, mediaUrl, parseVariants } from '@/lib/media';
import type { MediaInfo } from './render';

/** Public URLs, sizes and alt text of the photos an article uses, for rendering its HTML. */
export async function mediaInfoMap(ids: string[]): Promise<Map<string, MediaInfo>> {
  const map = new Map<string, MediaInfo>();
  if (!ids.length) return map;
  const rows = await prisma.mediaAsset.findMany({ where: { id: { in: ids }, deletedAt: null, kind: 'IMAGE' } });
  for (const m of rows) {
    const alt = m.alt;
    try {
      map.set(m.id, { src: mediaUrl(m.objectKey), srcset: buildSrcSet(m.objectKey, m.width, parseVariants(m.variants)), width: m.width, height: m.height, alt });
    } catch {
      // R2_PUBLIC_HOSTNAME not set: the photo cannot be shown, so it is left out of the HTML
    }
  }
  return map;
}
