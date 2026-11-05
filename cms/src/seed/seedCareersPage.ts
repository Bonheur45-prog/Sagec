/**
 * SEED: Careers Page Global
 * ─────────────────────────────────────────────────────────────
 * Run with: npm run seed:careers
 *
 * Fills the Careers Page global with the copy the site used before it
 * was wired to the CMS. Guarded like the other seeds: skipped if the
 * eyebrow is already set, so it's safe to re-run.
 *
 * JOBS: deliberately NOT seeded. The old static list was placeholder
 * roles — publishing them would invite real people to apply for jobs
 * that don't exist. Add real openings in the admin under "Job
 * Openings"; until then the page shows its "no open roles" state.
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

  const current = await payload.findGlobal({ slug: 'careers-page' })
  if (current?.eyebrow) {
    console.log('CareersPage already has content (eyebrow is set) — skipping.')
  } else {
    await payload.updateGlobal({
      slug: 'careers-page',
      data: {
        eyebrow: 'Join Our Team',
        headline: 'Build Rwanda’s Future With Us',
        headlineHighlight: 'Future',
        subline:
          'SAGEC is always looking for talented architects, engineers, and construction professionals who are passionate about shaping Rwanda’s built environment.',
        applyInstructions:
          'Send your CV and a brief cover letter to our HR team. We review all applications and will be in touch if your profile matches our requirements.',
        noJobsHeading: 'No Open Positions Right Now',
        noJobsText:
          'We don’t have any open roles at the moment, but we’re always interested in hearing from talented professionals. Send us your CV and we’ll keep you in mind for future opportunities.',
      },
    })
    console.log('CareersPage global seeded ✓')
  }

  process.exit(0)
}

run()
