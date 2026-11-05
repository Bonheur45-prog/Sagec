import { Link } from 'react-router-dom'
import Seo from '@components/ui/Seo'

export default function NotFoundPage() {
  return (
    <div style={{ padding: '160px 40px 120px', textAlign: 'center' }}>
      <Seo title="Page Not Found" noIndex path="/404" />
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '48px', color: 'var(--color-navy)', marginBottom: '16px' }}>
        404
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: 'var(--color-text-muted, #666)', marginBottom: '32px' }}>
        This page doesn't exist — it may have moved or been removed.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          color: 'var(--color-orange, #F26522)',
          textDecoration: 'underline',
        }}
      >
        Back to Home
      </Link>
    </div>
  )
}
