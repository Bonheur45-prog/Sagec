import type { ReactNode } from 'react';
import { AdminFrame, type AdminNavGroup } from '@/components/admin/AdminNav/AdminNav';

type Props = {
  businessName: string;
  user: { name: string; email: string };
  /** Badges: new contact messages and comments waiting for approval. */
  counts?: { messages: number; comments: number };
  logoutAction: () => Promise<void>;
  children: ReactNode;
};

/** The CMS menu (the frame itself is drawn by AdminFrame). The menu only lists screens that exist. */
export function AdminShell({ businessName, user, counts, logoutAction, children }: Props) {
  const groups: AdminNavGroup[] = [
    {
      links: [
        { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
        { href: '/admin/messages', label: 'Messages', icon: 'messages', count: counts?.messages },
        { href: '/admin/media', label: 'Media library', icon: 'media' },
      ],
    },
    {
      label: 'Website content',
      links: [
        { href: '/admin/pages', label: 'Pages', icon: 'pages' },
        { href: '/admin/services', label: 'Services', icon: 'services' },
        { href: '/admin/projects', label: 'Projects', icon: 'projects' },
        { href: '/admin/testimonials', label: 'Testimonials', icon: 'testimonials' },
        { href: '/admin/partners', label: 'Partners', icon: 'partners' },
        { href: '/admin/jobs', label: 'Job openings', icon: 'jobs' },
      ],
    },
    {
      label: 'Blog',
      links: [
        { href: '/admin/blog', label: 'Articles', icon: 'blog' },
        { href: '/admin/comments', label: 'Comments', icon: 'comments', count: counts?.comments },
        { href: '/admin/subscribers', label: 'Subscribers', icon: 'subscribers' },
      ],
    },
    {
      label: 'Site-wide',
      links: [
        { href: '/admin/header', label: 'Header', icon: 'header' },
        { href: '/admin/footer', label: 'Footer', icon: 'footer' },
        { href: '/admin/settings', label: 'Site settings', icon: 'settings' },
      ],
    },
    {
      label: 'Administration',
      links: [
        { href: '/admin/users', label: 'Users', icon: 'users' },
        { href: '/admin/activity', label: 'Activity', icon: 'activity' },
        { href: '/admin/trash', label: 'Trash', icon: 'trash' },
      ],
    },
  ];

  return (
    <AdminFrame groups={groups} businessName={businessName} user={user} logoutAction={logoutAction}>
      {children}
    </AdminFrame>
  );
}
