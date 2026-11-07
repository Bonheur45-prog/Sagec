import { Building2, FileText, Images, Inbox, Layers, LineChart, MessageSquare, Newspaper, Plus, Quote, Upload, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Notice } from '@/components/admin/Notice/Notice';
import { StatCard } from '@/components/admin/StatCard/StatCard';
import { StatusBadge } from '@/components/admin/StatusBadge/StatusBadge';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { PAGE_SLUGS } from '@/lib/pages/schema';
import { missingR2Settings } from '@/lib/storage/r2';
import styles from './dashboard.module.css';

export const metadata: Metadata = { title: 'Dashboard' };

/** What still needs setting up on the server, so nothing fails silently later. */
function setupWarnings(): { title: string; text: string }[] {
  const warnings: { title: string; text: string }[] = [];
  const r2 = missingR2Settings();
  if (r2.length) warnings.push({ title: 'File storage is not set up', text: `Add ${r2.join(', ')} to .env. Photos and videos cannot be uploaded until then.` });
  if (!process.env.SITE_URL) warnings.push({ title: 'SITE_URL is not set', text: 'Add the public address (https://…) to .env. It is used in the sitemap, share links and canonical addresses.' });
  if (!process.env.SMTP_HOST) warnings.push({ title: 'Email is not set up', text: 'Add the SMTP_* settings to .env so new contact messages are emailed to you. Until then they are only in Messages.' });
  if (!process.env.TURNSTILE_SECRET_KEY) warnings.push({ title: 'Spam protection is off', text: 'Add the Cloudflare Turnstile keys to .env to protect the contact form.' });
  return warnings;
}

const greeting = (d: Date) => {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Kigali' }).format(d));
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kigali' });
const when = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kigali' });

export default async function DashboardPage() {
  const user = await requireUser();
  const live = { status: 'PUBLISHED' as const, deletedAt: null };
  const [newMessages, waitingComments, media, users, settings, services, projects, posts, testimonials, recent] = await Promise.all([
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.blogComment.count({ where: { approved: false } }),
    prisma.mediaAsset.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { active: true } }),
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { googleAnalyticsId: true } }),
    prisma.service.count({ where: live }),
    prisma.project.count({ where: live }),
    prisma.post.count({ where: live }),
    prisma.testimonial.count({ where: live }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, subject: true, status: true, createdAt: true } }),
  ]);
  const analytics = settings?.googleAnalyticsId ?? '';
  const warnings = setupWarnings();
  const now = new Date();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.date}>{today.format(now)}</p>
          <h1 className={styles.hello}>
            {greeting(now)}, {user.name.split(' ')[0]}
          </h1>
          <p className={styles.heroLead}>Here is what is happening on the SAGEC Ltd website.</p>
        </div>
        <div className={styles.quick}>
          <Link href="/admin/blog" className={styles.quickPrimary}>
            <Plus size={16} aria-hidden="true" /> New article
          </Link>
          <Link href="/admin/projects" className={styles.quickLink}>
            <Building2 size={16} aria-hidden="true" /> Add a project
          </Link>
          <Link href="/admin/media" className={styles.quickLink}>
            <Upload size={16} aria-hidden="true" /> Upload photos
          </Link>
        </div>
      </section>

      {warnings.map((w) => (
        <Notice key={w.title} tone="warning" title={w.title}>
          {w.text}
        </Notice>
      ))}

      <div className={styles.stats}>
        <StatCard icon={<Inbox size={20} />} label="New messages" value={newMessages} highlight={newMessages > 0} href="/admin/messages?status=NEW" />
        <StatCard icon={<MessageSquare size={20} />} label="Comments waiting" value={waitingComments} highlight={waitingComments > 0} href="/admin/comments" />
        <StatCard icon={<Images size={20} />} label="Files in the media library" value={media} href="/admin/media" />
        <StatCard icon={<LineChart size={20} />} label={analytics ? `Google Analytics · ${analytics}` : 'Google Analytics is off'} value={analytics ? 'On' : 'Off'} href="/admin/settings" />
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Latest messages</h2>
            <Link href="/admin/messages" className={styles.panelLink}>
              See all
            </Link>
          </header>
          {recent.length ? (
            <ul className={styles.messages}>
              {recent.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/messages/${m.id}`} className={styles.message}>
                    <span className={styles.msgAvatar} aria-hidden="true">
                      {(m.name || '?').trim().charAt(0).toUpperCase()}
                    </span>
                    <span className={styles.msgText}>
                      <span className={styles.msgName}>{m.name || 'Visitor'}</span>
                      <span className={styles.msgSubject}>{m.subject || 'No subject'}</span>
                    </span>
                    <span className={styles.msgMeta}>
                      {m.status === 'NEW' && <StatusBadge status="NEW" />}
                      <time dateTime={m.createdAt.toISOString()}>{when.format(m.createdAt)}</time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyText}>No messages yet. They arrive here from the contact form.</p>
          )}
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <h2 className={styles.panelTitle}>On the website</h2>
          </header>
          <ul className={styles.content}>
            {[
              { href: '/admin/services', label: 'Services', value: services, icon: <Layers size={18} /> },
              { href: '/admin/projects', label: 'Projects', value: projects, icon: <Building2 size={18} /> },
              { href: '/admin/blog', label: 'Articles', value: posts, icon: <Newspaper size={18} /> },
              { href: '/admin/testimonials', label: 'Testimonials', value: testimonials, icon: <Quote size={18} /> },
              { href: '/admin/pages', label: 'Pages', value: PAGE_SLUGS.length, icon: <FileText size={18} /> },
              { href: '/admin/users', label: 'CMS users', value: users, icon: <Users size={18} /> },
            ].map((c) => (
              <li key={c.href}>
                <Link href={c.href} className={styles.contentRow}>
                  <span className={styles.contentIcon} aria-hidden="true">
                    {c.icon}
                  </span>
                  <span className={styles.contentLabel}>{c.label}</span>
                  <span className={styles.contentValue}>{c.value}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.note}>Published items only. Drafts and items in Trash are not counted.</p>
        </section>
      </div>
    </div>
  );
}
