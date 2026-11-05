/**
 * SEED: Testimonials Collection + Testimonials Page Global
 * ─────────────────────────────────────────────────────────────
 * Run with: npx tsx src/seed/seedTestimonials.ts
 *
 * Collection docs are matched (and skipped if already present) by
 * `name` — safe to re-run. The Testimonials Page global is guarded
 * like seedAbout.ts/seedHomePage.ts: skipped if eyebrow is already set.
 *
 * AVATARS: left blank for every seeded testimonial on purpose. Two
 * of these people had avatar URLs in the old static data, but both
 * were hotlinked to third-party CDNs (Pinterest / Instagram) rather
 * than real uploaded files — the Instagram one is a signed URL that
 * will expire. The frontend already shows initials when avatar is
 * blank, so nothing breaks; add real photos via the admin panel
 * whenever you have them.
 * ─────────────────────────────────────────────────────────────
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(__dirname, '../../.env') })

const TESTIMONIALS = [
  {
    name: 'Jean-Pierre Habimana',
    role: 'CEO, Kigali Commercial Ventures',
    quote:
      'SAGEC delivered the Silverback Mall project on time and to a standard that exceeded our expectations. Their attention to structural detail and site management is unmatched in Rwanda.',
  },
  {
    name: 'Claudine Uwimana',
    role: 'Director of Infrastructure, Rwanda Governance Board',
    quote:
      'Working with SAGEC on the RGB headquarters was a seamless experience. They understood our institutional requirements and translated them into a building that truly represents our mandate.',
  },
  {
    name: 'Patrick Nkurunziza',
    role: 'General Manager, Lemigo Hotel Kigali',
    quote:
      "The interior transformation of Lemigo Hotel was handled with exceptional professionalism. SAGEC's team respected our operational timeline and delivered a world-class finish.",
  },
  {
    name: 'Amina Ndahiro',
    role: 'Director, Ndahiro Properties Ltd',
    quote:
      "SAGEC brought deep local knowledge and international engineering standards to our Florida House project. The result is a residence that stands out in Kigali's skyline.",
  },
  {
    name: 'Emmanuel Bizimana',
    role: 'Head of Projects, Horizon Real Estate Rwanda',
    quote:
      'From planning through to handover, SAGEC maintained transparent communication and precise budgeting. I would not hesitate to engage them again for future developments.',
  },
  {
    name: 'Sophie Murekatete',
    role: 'Managing Director, Kigali Urban Developers',
    quote:
      'Their multidisciplinary team handled architecture, structural engineering, and fit-out under one roof. The efficiency and quality of coordination saved us months on the project schedule.',
  },
]

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })
  console.log('Payload initialized.\n')

  // ── Collection docs — skip any that already exist (matched by name) ──
  for (const [i, t] of TESTIMONIALS.entries()) {
    const existing = await payload.find({
      collection: 'testimonials',
      where: { name: { equals: t.name } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`  skipping "${t.name}" — already exists`)
      continue
    }
    await payload.create({
      collection: 'testimonials',
      data: { name: t.name, role: t.role, quote: t.quote, order: i },
    })
    console.log(`  created testimonial: ${t.name} ✓`)
  }

  // ── Testimonials Page global (hero copy) ──
  const current = await payload.findGlobal({ slug: 'testimonials-page' })
  if (current?.eyebrow) {
    console.log('\nTestimonialsPage already has content (eyebrow is set) — skipping global update.')
  } else {
    await payload.updateGlobal({
      slug: 'testimonials-page',
      data: {
        eyebrow: 'Client Stories',
        headlineLine1: 'What Our Clients',
        headlineLine2: 'Say About Us',
        subline: 'Real feedback from partners, developers, and institutions who trust SAGEC to bring their vision to life.',
      },
    })
    console.log('TestimonialsPage global seeded ✓')
  }

  console.log('\nTestimonials seed complete ✓')
  process.exit(0)
}

run()
