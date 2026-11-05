import { redirect } from 'next/navigation'

/**
 * In production, Nginx sends `/` to the React site, so this page is only
 * reached when hitting the CMS process directly (e.g. `localhost:3000`
 * in development). Send those visits straight to the admin.
 */
export default function RootRedirect() {
  redirect('/admin')
}
