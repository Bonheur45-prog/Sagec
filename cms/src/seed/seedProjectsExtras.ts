/**
 * SEED: Projects Page — Stats Strip + Home Partners heading
 * Run with: npm run seed:projects-extras
 *
 * Adds only the NEW fields to globals that already have content, and
 * never touches anything else:
 *   - projects-page.projectsStats  (skipped if any stats exist, or if the
 *     Projects Page has never been saved — fill it in the admin first)
 *   - home-page.partnersTeaser     (skipped if already set, or if the
 *     Home Page has never been saved)
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

  const projectsPage = await payload.findGlobal({ slug: 'projects-page' })
  if (!projectsPage?.projectsHero?.headlineLine1) {
    console.log('Projects Page has no content yet — fill it in the admin first, then re-run. Skipping stats.')
  } else if (projectsPage.projectsStats?.length) {
    console.log('Projects stats already set — skipping.')
  } else {
    await payload.updateGlobal({
      slug: 'projects-page',
      data: {
        projectsStats: [
          { value: 10, suffix: '+', label: 'Years Experience' },
          { value: 30, suffix: '+', label: 'Projects Completed' },
          { value: 50, suffix: '+', label: 'Happy Clients' },
          { text: 'Kigali', label: 'Rwanda' },
        ],
      },
    })
    console.log('Projects stats seeded ✓')
  }

  const homePage = await payload.findGlobal({ slug: 'home-page' })
  if (!homePage?.hero?.slides?.length) {
    console.log('Home Page has no content yet — run seed:home first. Skipping partners heading.')
  } else if (homePage.partnersTeaser?.heading) {
    console.log('Partners heading already set — skipping.')
  } else {
    await payload.updateGlobal({
      slug: 'home-page',
      data: { partnersTeaser: { eyebrow: 'Trusted By', heading: 'Our Partners' } },
    })
    console.log('Partners heading seeded ✓')
  }

  process.exit(0)
}

run()
