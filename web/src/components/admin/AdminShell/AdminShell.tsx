import Link from 'next/link';
import type { ReactNode } from 'react';
import { AdminNav, type AdminNavLink } from '@/components/admin/AdminNav/AdminNav';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import styles from './AdminShell.module.css';

type Props = {
  businessName: string;
  user: { name: string; email: string };
  /** Badges: new contact messages and comments waiting for approval. */
  counts?: { messages: number; comments: number };
  logoutAction: () => Promise<void>;
  children: ReactNode;
};

/**
 * CMS frame: navy sidebar with navigation (top bar on phones) and the page content.
 * The menu only lists screens that exist. Each build phase adds its own links:
 * (Page texts arrive with the public site.)
 */
export function AdminShell({ businessName, user, counts, logoutAction, children }: Props) {
  const groups: { label?: string; links: AdminNavLink[] }[] = [
    {
      links: [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/messages', label: 'Messages', count: counts?.messages },
        { href: '/admin/media', label: 'Media library' },
      ],
    },
    {
      label: 'Content',
      links: [
        { href: '/admin/pages', label: 'Pages' },
        { href: '/admin/blog', label: 'Blog' },
        { href: '/admin/comments', label: 'Comments', count: counts?.comments },
        { href: '/admin/services', label: 'Services' },
        { href: '/admin/projects', label: 'Projects' },
        { href: '/admin/testimonials', label: 'Testimonials' },
        { href: '/admin/partners', label: 'Partners' },
        { href: '/admin/jobs', label: 'Job openings' },
        { href: '/admin/subscribers', label: 'Subscribers' },
        { href: '/admin/trash', label: 'Trash' },
      ],
    },
    {
      label: 'Site-wide',
      links: [
        { href: '/admin/header', label: 'Header' },
        { href: '/admin/footer', label: 'Footer' },
        { href: '/admin/settings', label: 'Site settings' },
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
