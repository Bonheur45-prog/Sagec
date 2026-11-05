import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell/AdminShell';
import { requireUser } from '@/lib/auth/session';
import { getSiteSettings } from '@/lib/settings';
import { logout } from '../actions';

// Every page inside (cms) requires a valid session. Server actions check again on their own,
// because they can be called directly without loading this layout.
export default async function CmsLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const settings = await getSiteSettings();

  return (
    <AdminShell businessName={settings.businessName} user={user} logoutAction={logout}>
      {children}
    </AdminShell>
  );
}
