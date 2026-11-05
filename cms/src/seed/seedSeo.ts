/**
 * SEED: SEO Settings Global
 * Run with: npm run seed:seo
 *
 * Fills in the page titles/descriptions that used to be hardcoded in the
 * frontend page files. Skipped if the global already has content.
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

  const current = await payload.findGlobal({ slug: 'seo-settings' })
  if (current?.home?.title || current?.about?.title || current?.defaultDescription) {
    console.log('SEO Settings already has content — skipping to avoid overwriting your edits.')
    process.exit(0)
  }

  await payload.updateGlobal({
    slug: 'seo-settings',
    data: {
      siteName: 'SAGEC Ltd',
      defaultDescription:
        "SAGEC Ltd — Architectural and Engineering Solutions. Rwanda's leading firm delivering innovative architecture, engineering, and construction excellence in Kigali.",
      home: {},
      about: {
        title: 'About Us',
        description:
          "Learn about SAGEC Ltd — Rwanda's architectural and engineering firm delivering landmark construction projects across Kigali.",
      },
      services: {
        title: 'Our Services',
        description:
          'Architecture, structural engineering, MEP, and construction management services from SAGEC Ltd, Kigali.',
      },
      projects: {
        title: 'Our Projects',
        description:
          'Explore landmark commercial, residential, and interior design projects delivered by SAGEC Ltd across Rwanda.',
      },
      testimonials: {
        title: 'Testimonials',
        description:
          'See what clients say about working with SAGEC Ltd on their architecture and construction projects.',
      },
      blog: {
        title: 'Blog',
        description:
          'Insights on architecture, engineering, and construction in Rwanda from the SAGEC Ltd team.',
      },
      contact: {
        title: 'Contact Us',
        description:
          'Get in touch with SAGEC Ltd for your next architecture, engineering, or construction project in Rwanda.',
      },
    },
  })

  console.log('SEO Settings Global seeded ✓')
  process.exit(0)
}

run()
