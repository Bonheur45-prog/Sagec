import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import styles from '@/components/admin/PageEditor/PageEditor.module.css';
import { requireUser } from '@/lib/auth/session';
import { pageKey } from '@/lib/cms/drafts';
import { prisma } from '@/lib/db';
import { PAGE_INFO, PAGE_SLUGS } from '@/lib/pages/schema';

export const metadata: Metadata = { title: 'Pages' };

const when = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Kigali' });

/** Every page whose texts and photos can be edited, with where it stands. */
export default async function PagesList() {
  await requireUser();
  const rows = await prisma.globalSection.findMany({ where: { key: { in: PAGE_SLUGS.map(pageKey) } } });
  return (
    <>
      <PageHeader title="Pages" description="The texts and photos of each page of the website. Services, projects, reviews, jobs and articles have their own sections in the menu." />
      <div className={styles.list}>
        {PAGE_SLUGS.map((slug) => {
          const row = rows.find((r) => r.key === pageKey(slug));
          const info = PAGE_INFO[slug];
          const changed = row && JSON.stringify(row.draft) !== JSON.stringify(row.published ?? {}) && Object.keys((row.draft as object) ?? {}).length > 0;
          return (
            <Link key={slug} href={`/admin/pages/${slug}`} className={styles.card}>
              <span className={styles.cardTitle}>{info.title}</span>
              <span className={styles.hint}>{info.blurb}</span>
              <span className={styles.badge} data-tone={changed ? 'pending' : undefined}>
                {row?.publishedAt ? `Published ${when.format(row.publishedAt)}` : 'Starter text (not edited yet)'}
                {changed ? ' · unpublished changes' : ''}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
