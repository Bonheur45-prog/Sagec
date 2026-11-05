/**
 * FIX: de-duplicate the shared placeholder image on HomePage
 * ─────────────────────────────────────────────────────────────
 * Run with: npx tsx src/seed/fixSharedPlaceholders.ts
 *
 * seedHomePage.ts originally uploaded ONE placeholder Media doc and
 * reused its id for 8 different image fields (5 hero slides, the hero
 * foreground image, and both Why Choose Us images). In Payload,
 * replacing the FILE on a shared doc updates it everywhere that id is
 * referenced — which is exactly the "editing one slide changes all of
 * them" bug.
 *
 * This script only touches fields that still point at that original
 * shared doc — it never touches a field you've already replaced with
 * your own upload (like your new video slide 1 / image slide 2), so
 * it's safe to run now, with real content already in place, and safe
 * to re-run afterwards (a no-op once nothing points at the shared doc
 * anymore).
 * ─────────────────────────────────────────────────────────────
 */

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.resolve(__dirname, '../../.env') })

const PLACEHOLDER_ALT = 'Placeholder — replace via admin UI'

async function run() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })
  console.log('Payload initialized.\n')

  const placeholderMatch = await payload.find({
    collection: 'media',
    where: { alt: { equals: PLACEHOLDER_ALT } },
    limit: 1,
  })
  const placeholder = placeholderMatch.docs[0]
  if (!placeholder) {
    console.log('No shared placeholder found — nothing to fix.')
    process.exit(0)
  }
  const placeholderId = String(placeholder.id)
  const placeholderBuffer = fs.readFileSync(path.resolve(__dirname, 'assets/placeholder.jpg'))

  let cloneCount = 0
  async function cloneIfShared(currentId: unknown, label: string): Promise<string | unknown> {
    if (String(currentId) !== placeholderId) return currentId // already replaced by the user — leave it alone
    const clone = await payload.create({
      collection: 'media',
      data: { alt: PLACEHOLDER_ALT },
      file: { data: placeholderBuffer, mimetype: 'image/jpeg', name: 'placeholder.jpg', size: placeholderBuffer.length },
    })
    cloneCount++
    console.log(`  gave "${label}" its own independent copy ✓`)
    return clone.id
  }

  const home = await payload.findGlobal({ slug: 'home-page', depth: 0 })
  if (!home?.hero) {
    console.log('HomePage has no hero data yet — nothing to fix.')
    process.exit(0)
  }

  const fixedSlides = []
  for (const [i, slide] of (home.hero.slides ?? []).entries()) {
    fixedSlides.push({
      ...slide,
      image: slide.image ? await cloneIfShared(slide.image, `slide ${i + 1} image`) : slide.image,
    })
  }

  const fixedForegroundImage = home.hero.foreground?.image
    ? await cloneIfShared(home.hero.foreground.image, 'hero foreground image')
    : home.hero.foreground?.image

  const fixedWhyChooseUsBg = home.whyChooseUs?.backgroundImage
    ? await cloneIfShared(home.whyChooseUs.backgroundImage, 'Why Choose Us background image')
    : home.whyChooseUs?.backgroundImage

  const fixedWhyChooseUsMediaImage = home.whyChooseUs?.media?.image
    ? await cloneIfShared(home.whyChooseUs.media.image, 'Why Choose Us media image')
    : home.whyChooseUs?.media?.image

  if (cloneCount === 0) {
    console.log('Nothing still points at the shared placeholder — already fixed, no changes made.')
    process.exit(0)
  }

  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      hero: {
        ...home.hero,
        slides: fixedSlides,
        foreground: { ...home.hero.foreground, image: fixedForegroundImage },
      },
      whyChooseUs: {
        ...home.whyChooseUs,
        backgroundImage: fixedWhyChooseUsBg,
        media: { ...home.whyChooseUs.media, image: fixedWhyChooseUsMediaImage },
      },
    },
  })

  console.log(`\nFixed ✓ — ${cloneCount} field(s) now have their own independent image instead of sharing one.`)
  console.log('You can still replace any of them individually in the admin panel as normal from here on.')
  process.exit(0)
}

run()
