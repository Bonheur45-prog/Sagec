import type { Metadata } from 'next';
import NotFoundPage from '@pages/NotFoundPage';

export const metadata: Metadata = { title: 'Page not found — SAGEC Ltd', robots: { index: false, follow: false } };

export default function NotFound() {
  return <NotFoundPage />;
}
