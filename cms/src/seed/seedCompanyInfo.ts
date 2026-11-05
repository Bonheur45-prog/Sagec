/**
 * SEED: Company Info Global
 * ─────────────────────────────────────────────────────────────
 * Run with: npx tsx src/seed/seedCompanyInfo.ts
 *
 * Guarded like the other global seeders: skipped if `phone` is
 * already set.
 *
 * HEADS UP — conflicting source data: the old hardcoded copy had
 * TWO different business-hours strings for the same company —
 * Footer.jsx said "Mon-Fri 8:00-5:00 / Sat 9:00-1:00" while
 * ContactMain.jsx said "Mon-Fri, 8:00 AM - 6:00 PM" with no Saturday
 * row at all. This seeder uses the Footer version (it's the more
 * complete one) — please confirm the real hours in the admin panel,
 * since one of the two was wrong.
 *
 * Social links (Instagram/LinkedIn/X/Facebook) were also generic
 * placeholders (instagram.com, linkedin.com, x.com, facebook.com)
 * rather than SAGEC's real profile URLs — seeded as-is so nothing
 * regresses, but they should be replaced with real profile links
 * before launch.
 * ─────────────────────────────────────────────────────────────
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(__dirname, '../../.env') })

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })
  console.log('Payload initialized.\n')

  const current = await payload.findGlobal({ slug: 'company-info' })
  if (current?.phone) {
    console.log('CompanyInfo already has content (phone is set) — skipping to avoid overwriting your edits.')
    process.exit(0)
  }

  await payload.updateGlobal({
    slug: 'company-info',
    data: {
      tagline:
        'Delivering landmark architectural and engineering construction projects across Rwanda and East Africa — built to last, designed to inspire.',
      phone: '+250 788 470 243',
      email: 'sagecltd@gmail.com',
      address: 'Kigali, Rwanda',
      whatsappNumber: '250788470243',
      whatsappLabel: 'Chat on WhatsApp',
      responseNote: 'Prefer a quick reply? WhatsApp is the fastest way to reach our team.',
      businessHours: [
        { day: 'Monday \u2013 Friday', hours: '8:00 AM \u2013 5:00 PM' },
        { day: 'Saturday', hours: '9:00 AM \u2013 1:00 PM' },
      ],
      socials: [
        { iconKey: 'instagram', href: 'https://instagram.com' },
        { iconKey: 'linkedin', href: 'https://linkedin.com' },
        { iconKey: 'x', href: 'https://x.com' },
        { iconKey: 'facebook', href: 'https://facebook.com' },
      ],
    },
  })

  console.log('\nCompanyInfo Global seeded ✓')
  process.exit(0)
}

run()
