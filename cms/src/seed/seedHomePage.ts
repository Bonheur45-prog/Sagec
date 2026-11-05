/**
 * SEED: Home Page Global
 * ─────────────────────────────────────────────────────────────
 * Run with: npx tsx src/seed/seedHomePage.ts
 *
 * Global (singleton) — guarded the same way as seedAbout.ts: if
 * hero.eyebrow is already set, this exits without writing anything,
 * so it can never clobber edits made by hand in the admin panel.
 *
 * IMAGES: there are no real hero photos anywhere in this handoff
 * (no /public folder, no src/assets images) — every image field
 * below (hero slides, foreground worker image, Why Choose Us
 * background + media) falls back to the shared placeholder.jpg.
 * Replace them in the admin panel (Globals -> Home Page) whenever
 * real photography is ready — nothing else needs to change.
 * ─────────────────────────────────────────────────────────────
 */

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.resolve(__dirname, 'assets')

loadEnv({ path: path.resolve(__dirname, '../../.env') })

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })
  console.log('Payload initialized.\n')

  const current = await payload.findGlobal({ slug: 'home-page' })
  if (current?.hero?.eyebrow) {
    console.log(
      'HomePage already has content (hero.eyebrow is set) — skipping to avoid overwriting your edits.',
    )
    process.exit(0)
  }

  // ── Shared fallback placeholder (reused if seedAbout.ts already made one) ──
  const PLACEHOLDER_ALT = 'Placeholder — replace via admin UI'
  let placeholder = (
    await payload.find({ collection: 'media', where: { alt: { equals: PLACEHOLDER_ALT } }, limit: 1 })
  ).docs[0]

  if (!placeholder) {
    const filePath = path.resolve(ASSETS_DIR, 'placeholder.jpg')
    const fileBuffer = fs.readFileSync(filePath)
    placeholder = await payload.create({
      collection: 'media',
      data: { alt: PLACEHOLDER_ALT },
      file: { data: fileBuffer, mimetype: 'image/jpeg', name: 'placeholder.jpg', size: fileBuffer.length },
    })
    console.log('Uploaded shared fallback placeholder.\n')
  } else {
    console.log('Reusing existing fallback placeholder.\n')
  }
  const placeholderId = String(placeholder.id)

  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      hero: {
        eyebrow: 'Architectural & Engineering Solutions',
        slides: [
          {
            type: 'image',
            image: placeholderId,
            headline: 'Building Excellence',
            subline: 'Your Vision, Our Expertise — delivering innovative architecture and construction across Rwanda.',
            duration: 7000,
          },
          {
            type: 'image',
            image: placeholderId,
            headline: 'Landmark Commercial Projects',
            subline: "Iconic structures that define Kigali's skyline — built with precision and purpose.",
            duration: 7000,
          },
          {
            type: 'image',
            image: placeholderId,
            headline: 'Precision Engineering',
            subline: 'Where structural excellence meets architectural beauty — every detail engineered to last.',
            duration: 7000,
          },
          {
            type: 'image',
            image: placeholderId,
            headline: 'Interior Design Excellence',
            subline: 'Transforming spaces into unforgettable experiences — where style meets function.',
            duration: 7000,
          },
          {
            type: 'image',
            image: placeholderId,
            headline: "Shaping Rwanda's Future",
            subline: 'Delivering innovative, sustainable construction solutions — building tomorrow, today.',
            duration: 7000,
          },
        ],
        foreground: {
          image: placeholderId,
          alt: 'SAGEC site engineer overseeing construction',
        },
        primaryBtnLabel: 'View Our Projects',
        primaryBtnLink: '/projects',
        secondaryBtnLabel: 'Get in Touch',
        secondaryBtnLink: '/contact',
      },
      stats: {
        eyebrow: 'Our Impact',
        heading: 'Numbers That Define Us',
        supportingText:
          'Every project is a testament to our commitment — built on trust, precision, and a relentless pursuit of excellence.',
        items: [
          {
            iconKey: 'years',
            value: 10,
            suffix: '+',
            label: 'Years Experience',
            description: 'Over a decade of delivering architectural and engineering excellence across Rwanda.',
          },
          {
            iconKey: 'projects',
            value: 30,
            suffix: '+',
            label: 'Projects Completed',
            description: 'From landmark commercial buildings to premium interior design commissions.',
          },
          {
            iconKey: 'clients',
            value: 50,
            suffix: '+',
            label: 'Happy Clients',
            description: 'Trusted by government institutions, private developers, and businesses alike.',
          },
          {
            iconKey: 'location',
            text: 'Kigali',
            suffix: '',
            label: 'Rwanda',
            description: 'Headquartered in Kigali, delivering landmark projects across the nation.',
          },
        ],
      },
      servicesTeaser: {
        eyebrow: 'What We Offer',
        heading: 'Our Services',
        viewAllLabel: 'View All Services',
        viewAllLink: '/services',
      },
      projectsTeaser: {
        eyebrow: 'Our Work',
        headingStart: 'Featured',
        headingHighlight: 'Projects',
        subtext: 'From landmark commercial developments to refined interiors — built with precision across Rwanda.',
        viewAllLabel: 'View All Projects',
        viewAllLink: '/projects',
      },
      testimonialsTeaser: {
        eyebrow: 'Testimonials',
        heading: 'Trusted By Rwanda\u2019s Leading Developers',
        description:
          'From first consultation to final handover, our clients trust SAGEC to deliver with precision, transparency, and lasting quality — here is what a few of them have to say.',
      },
      // NOTE: there is no Partners section built on the site yet (no UI,
      // no logos) — this copy is seeded only so the required fields on
      // this global don't block saving. Safe to edit/ignore until the
      // Partners section is actually built.
      partnersSection: {
        eyebrow: 'Our Partners',
        heading: 'Trusted By Industry Leaders',
        description: 'We collaborate with leading suppliers, consultants, and institutions across Rwanda.',
      },
      whyChooseUs: {
        eyebrow: 'Why choose us',
        headingStart: 'Built on',
        headingHighlight: 'Trust',
        headingEnd: 'Delivered with Precision',
        subtext:
          'SAGEC brings together experience, local knowledge, and international standards — so every project stands as a testament to what Rwandan construction can achieve.',
        reasons: [
          {
            title: '20+ Years of Proven Experience',
            description: 'Two decades of delivering landmark structures across Rwanda, from commercial towers to civic institutions.',
          },
          {
            title: 'International Quality Standards',
            description: 'Every project meets rigorous engineering benchmarks, ensuring safety, durability, and long-term value.',
          },
          {
            title: 'Deep Local Expertise',
            description: "Unmatched knowledge of Kigali's terrain, regulations, and supply chain — no learning curve, no surprises.",
          },
          {
            title: 'Multidisciplinary Expert Team',
            description: 'Architects, structural engineers, and project managers working as one integrated unit on every build.',
          },
          {
            title: 'On-Time, On-Budget Delivery',
            description: 'A disciplined project management process that consistently meets deadlines and respects agreed budgets.',
          },
          {
            title: "Trusted by Rwanda's Leaders",
            description: 'Chosen by government bodies, major investors, and private developers for projects that cannot afford failure.',
          },
        ],
        backgroundImage: placeholderId,
        media: {
          type: 'image',
          image: placeholderId,
          alt: 'SAGEC construction team at work on a Kigali project',
        },
        ctaLabel: 'Meet Our Team',
        ctaLink: '/about',
      },
      cta: {
        eyebrow: 'Ready to Build?',
        headingStart: "Let's Bring Your",
        headingHighlight: 'Vision',
        headingEnd: 'to Life',
        subline: 'Whether you have detailed plans or just an idea — our team is ready to listen, advise, and deliver. Get in touch today.',
        primaryBtnLabel: 'Start a Project',
        primaryBtnLink: '/contact',
        secondaryBtnLabel: 'View Our Work',
        secondaryBtnLink: '/projects',
      },
    },
  })

  console.log('\nHomePage Global seeded ✓')
  process.exit(0)
}

run()
