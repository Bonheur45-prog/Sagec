/**
 * SEED: About Page Global
 * ─────────────────────────────────────────────────────────────
 * Run with: npx tsx src/seed/seedAbout.ts
 *
 * This is a GLOBAL (singleton), not a collection — so instead of
 * checking "does this document exist," it checks "has this already
 * been filled in with real content." If story.heading is already set,
 * the script exits without writing anything, so it can never clobber
 * edits you've made by hand in the admin panel.
 *
 * Real images: drop files into seed/assets/ using these exact names
 * (any of .jpg/.jpeg/.png/.webp):
 *   about_story    -> the Our Story section image
 *   about_cta_bg   -> the closing CTA's background image
 * Either one missing falls back to the shared placeholder.
 * ─────────────────────────────────────────────────────────────
 */

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.resolve(__dirname, 'assets')
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// Load .env from the project root explicitly (same reasoning as seedBlog.ts —
// dotenv defaults to process.cwd(), which is wrong if run from inside src/).
loadEnv({ path: path.resolve(__dirname, '../../.env') })

function findAssetFile(baseName: string): string | null {
  for (const ext of ALLOWED_EXTENSIONS) {
    const candidate = path.join(ASSETS_DIR, baseName + ext)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('..//payload.config')
  const payload = await getPayload({ config })
  console.log('Payload initialized.\n')

  // ── Guard: don't overwrite existing manual content ──────────
  const current = await payload.findGlobal({ slug: 'about-page' })
  if (current?.story?.heading) {
    console.log(
      'AboutPage already has content (story.heading is set) — skipping to avoid overwriting your edits.',
    )
    process.exit(0)
  }

  // ── Shared fallback placeholder ──────────────────────────────
  const PLACEHOLDER_ALT = 'Placeholder — replace via admin UI'
  let placeholder = (
    await payload.find({
      collection: 'media',
      where: { alt: { equals: PLACEHOLDER_ALT } },
      limit: 1,
    })
  ).docs[0]

  if (!placeholder) {
    const filePath = path.resolve(__dirname, 'assets/placeholder.jpg')
    const fileBuffer = fs.readFileSync(filePath)
    placeholder = await payload.create({
      collection: 'media',
      data: { alt: PLACEHOLDER_ALT },
      file: {
        data: fileBuffer,
        mimetype: 'image/jpeg',
        name: 'placeholder.jpg',
        size: fileBuffer.length,
      },
    })
    console.log('Uploaded shared fallback placeholder.\n')
  } else {
    console.log('Reusing existing fallback placeholder.\n')
  }

  async function resolveImage(baseName: string): Promise<string> {
    const existing = (
      await payload.find({ collection: 'media', where: { alt: { equals: baseName } }, limit: 1 })
    ).docs[0]
    if (existing) return String(existing.id)

    const filePath = findAssetFile(baseName)
    if (!filePath) {
      console.log(`  (no file found for "${baseName}" — using placeholder)`)
      return String(placeholder.id)
    }

    const fileBuffer = fs.readFileSync(filePath)
    const uploaded = await payload.create({
      collection: 'media',
      data: { alt: baseName },
      file: {
        data: fileBuffer,
        mimetype: `image/${path.extname(filePath).slice(1)}`,
        name: path.basename(filePath),
        size: fileBuffer.length,
      },
    })
    console.log(`  uploaded real image for "${baseName}" ✓`)
    return String(uploaded.id)
  }

  const storyImageId = await resolveImage('about_story')
  const ctaBgImageId = await resolveImage('about_cta_bg')
  const heroBgImageId = await resolveImage('about-hero')
  const timelineBgImageId = await resolveImage('timeline-bg')

  await payload.updateGlobal({
    slug: 'about-page',
    data: {
      hero: {
        eyebrow: 'Our Company',
        headline: 'About SAGEC',
        subline: "Designing and engineering Rwanda's future, one landmark at a time.",
        backgroundImage: heroBgImageId,
      },
      missionVisionEyebrow: 'Who We Are',
      missionVisionHeadingStart: 'Our',
      missionVisionHeadingHighlight: 'Purpose',
      coreValuesEyebrow: 'What Drives Us',
      coreValuesHeading: 'Our Core Values',
      timelineEyebrow: 'Our Journey',
      timelineHeading: 'Milestones That Define Us',
      timelineBackgroundImage: timelineBgImageId,
      story: {
        eyebrow: 'Our Story',
        heading: 'Built From the Ground Up',
        paragraphs: [
          {
            text: 'SAGEC Ltd was founded with a singular vision — to deliver world-class architectural and engineering solutions that elevate Rwanda\u2019s built environment. From our earliest projects in Kigali, we built a reputation for precision, innovation, and an unwavering commitment to quality.',
          },
          {
            text: 'Over the years, we have grown from a focused architectural practice into a full-service firm spanning structural engineering, MEP systems, project management, construction management, and interior design. Each discipline strengthened by the last — and every project a stepping stone to the next.',
          },
          {
            text: 'Today, SAGEC stands behind some of Kigali\u2019s most recognisable landmarks. But for us, the most important structure is always the next one — and the trust our clients place in us to bring their vision to life.',
          },
        ],
        quote: 'We don\u2019t just build structures. We build trust, one project at a time.',
        image: storyImageId,
        imageAlt: 'SAGEC team at a construction site in Kigali',
      },
      missionVision: {
        mission: {
          eyebrow: 'Our Mission',
          heading: 'Why We Build',
          text: 'To deliver innovative, sustainable, and high-quality architectural and engineering solutions that transform Rwanda\u2019s built environment — empowering communities, enabling commerce, and reflecting the ambition of a rising nation.',
        },
        vision: {
          eyebrow: 'Our Vision',
          heading: 'Where We\u2019re Going',
          text: 'To be East Africa\u2019s most trusted architectural and engineering firm — recognised for excellence in design, integrity in delivery, and a legacy of landmark structures that stand for generations.',
        },
      },
      coreValues: [
        {
          iconKey: 'quality',
          title: 'Uncompromising Quality',
          description:
            'Every detail matters. We hold ourselves to the highest standards of craftsmanship and engineering rigour — on every project, at every scale.',
        },
        {
          iconKey: 'innovation',
          title: 'Bold Innovation',
          description:
            'We embrace new ideas, technologies, and methodologies to solve complex challenges and deliver solutions that are ahead of their time.',
        },
        {
          iconKey: 'integrity',
          title: 'Absolute Integrity',
          description:
            'We build trust the same way we build structures — carefully, consistently, and with total transparency. Our word is our contract.',
        },
        {
          iconKey: 'sustainability',
          title: 'Sustainable Thinking',
          description:
            'We design and build with the future in mind — creating structures that are environmentally responsible and endure for generations.',
        },
      ],
      // NOTE: year is still "20XX" placeholder here, same as the frontend data —
      // replace with real years directly in the admin panel after seeding.
      milestones: [
        {
          year: '20XX',
          badge: 'Founded',
          title: 'SAGEC Is Established',
          description:
            'SAGEC Ltd is founded in Kigali with a vision to deliver world-class architectural and engineering solutions across Rwanda.',
        },
        {
          year: '20XX',
          badge: 'First Major Project',
          title: 'First Landmark Commission',
          description:
            'SAGEC completes its first major commercial project in Kigali, establishing a reputation for precision and quality delivery.',
        },
        {
          year: '20XX',
          badge: 'Milestone',
          title: 'Kigali Business Plaza',
          description:
            'SAGEC delivers Kigali Business Plaza — a landmark mixed-use commercial development anchoring its district in central Kigali.',
        },
        {
          year: '20XX',
          badge: 'Interior Design',
          title: 'Grand Legacy Hotel Interior',
          description:
            'A full interior fit-out for a premier hospitality client, showcasing SAGEC\u2019s capability across luxury hospitality environments.',
        },
        {
          year: '20XX',
          badge: 'In Progress',
          title: 'Rwanda Trade & Innovation Center',
          description:
            'SAGEC breaks ground on an institutional development in Remera — one of the firm\u2019s most prestigious public commissions to date.',
        },
        {
          year: '20XX',
          badge: 'Expansion',
          title: 'Growing Portfolio Across Rwanda',
          description:
            'With projects spanning Kigali, Musanze, and beyond, SAGEC continues to expand its footprint across commercial, residential, and infrastructure sectors.',
        },
      ],
      aboutCTA: {
        eyebrow: 'Work With Us',
        heading: 'Ready to Build Something Great?',
        subline:
          'Whether you have a concept or a full brief — our team is ready to bring your vision to life.',
        backgroundImage: ctaBgImageId,
        primaryBtnLabel: 'Start a Project',
        primaryBtnLink: '/contact',
        secondaryBtnLabel: 'View Our Work',
        secondaryBtnLink: '/projects',
      },
    },
  })

  console.log('\nAboutPage Global seeded ✓')
  process.exit(0)
}

run()
