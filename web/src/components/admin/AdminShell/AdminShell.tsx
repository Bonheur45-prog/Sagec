import Link from 'next/link';
import type { ReactNode } from 'react';
import { AdminNav, type AdminNavLink } from '@/components/admin/AdminNav/AdminNav';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import styles from './AdminShell.module.css';

type Props = {
  businessName: string;
  user: { name: string; email: string };
  logoutAction: () => Promise<void>;
  children: ReactNode;
};

/**
 * CMS frame: navy sidebar with navigation (top bar on phones) and the page content.
 * The menu only lists screens that exist. Each build phase adds its own links:
 * Phase 2 Site-wide (settings, header, footer) · Phase 3 Content + Messages · Phase 4 Pages · Phase 5 Blog.
 */
export function AdminShell({ businessName, user, logoutAction, children }: Props) {
  const groups: { label?: string; links: AdminNavLink[] }[] = [
    {
      links: [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/media', label: 'Media library' },
      ],
    },
    {
      label: 'System',
      links: [
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/activity', label: 'Activity' },
      ],
    },
  ];

  return (
    <div className={styles.shell}>
      <a href="#admin-main" className={styles.skip}>
        Skip to content
      </a>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/admin" className={styles.brandLink} aria-label={`${businessName} — Dashboard`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small fixed brand file, no resizing needed */}
            <img src="/images/brand/sagec-logo-light.png" alt={businessName} width={426} height={110} className={styles.brandLogo} />
          </Link>
          <span className={styles.brandSub}>Content manager</span>
        </div>
        <AdminNav groups={groups} />
        <div className={styles.account}>
          <p className={styles.user}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </p>
          <div className={styles.accountActions}>
            <Link href="/" className={styles.viewSite} target="_blank" rel="noopener">
              View website ↗
            </Link>
            <form action={logoutAction}>
              <ConfirmButton variant="ghost" size="sm" className={styles.logout}>
                Log out
              </ConfirmButton>
            </form>
          </div>
        </div>
      </aside>
      <main id="admin-main" className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
