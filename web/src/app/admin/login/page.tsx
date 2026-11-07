import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm/LoginForm';
import { getCurrentUser } from '@/lib/auth/session';
import { getSiteSettings } from '@/lib/settings';
import { login } from './actions';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/admin');
  const settings = await getSiteSettings();

  return (
    <main className={styles.page}>
      {/* Brand side: navy panel with a drawing-grid pattern (hidden on phones). */}
      <section className={styles.brandSide} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- small fixed brand file, no resizing needed */}
        <img src="/images/brand/sagec-logo-light.png" alt="" width={426} height={110} className={styles.brandLogo} />
        <div className={styles.brandText}>
          <p className={styles.kicker}>Architectural &amp; Engineering Solutions</p>
          <p className={styles.statement}>
            Every project, page and photo on <span>sagecltd.com</span>, managed in one place.
          </p>
        </div>
        <p className={styles.brandFoot}>{settings.businessName} · Kigali, Rwanda</p>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small fixed brand file, no resizing needed */}
          <img src="/images/brand/sagec-logo.png" alt={settings.businessName} width={426} height={110} className={styles.logo} />
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.lead}>Log in to the SAGEC workspace.</p>
          <LoginForm action={login} />
          <p className={styles.help}>Forgot your password? Ask another SAGEC CMS user or your developer to reset it.</p>
        </div>
      </section>
    </main>
  );
}
