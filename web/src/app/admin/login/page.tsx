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
      <div className={styles.card}>
        {/* eslint-disable-next-line @next/next/no-img-element -- small fixed brand file, no resizing needed */}
        <img src="/images/brand/sagec-logo.png" alt={settings.businessName} width={426} height={110} className={styles.logo} />
        <h1 className={styles.title}>Content manager</h1>
        <LoginForm action={login} />
        <p className={styles.help}>
          Forgot your password? Ask another SAGEC CMS user or your developer to reset it.
        </p>
      </div>
    </main>
  );
}
