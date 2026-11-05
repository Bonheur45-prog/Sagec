/**
 * SEED: Blog Posts + Comments
 * ─────────────────────────────────────────────────────────────
 * Run with: npx tsx seed/seedBlog.ts
 * (One-time dev dependencies needed: npm install -D tsx dotenv)
 *
 * IMPORTANT: this file assumes it lives at src/seed/seedBlog.ts,
 * with payload.config.ts at the project root (one level above src/).
 * If your layout differs, adjust the `import config from` path below.
 *
 * Safe to re-run — skips any post that already exists (matched by slug)
 * and any comment that already exists (matched by post + name + text).
 *
 * Real images: drop files into seed/assets/ using these exact names
 * (any of .jpg/.jpeg/.png/.webp):
 *   blogcover_1 .. blogcover_6        -> cover image for post 1..6
 *   blog_1_inline_1, blog_4_inline_1  -> the inline image in posts 1 and 4
 *   blog_2_gallery_1, blog_2_gallery_2 -> the two gallery images in post 2
 * Any file not found falls back to the shared placeholder — nothing
 * blocks on missing images, you can add them incrementally.
 * ─────────────────────────────────────────────────────────────
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import config from '../payload.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.resolve(__dirname, 'assets')
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

type BlogCategory = 'Construction' | 'Architecture' | 'Sustainability' | 'Company News'

type SeedPost = {
  slug: string
  title: string
  excerpt: string
  category: BlogCategory
  tags: string[]
  authorId: number
  publishedAt: string
  content: Array<{
    type: string
    text?: string
    caption?: string
    items?: string[]
    imageCount?: number
    author?: string
  }>
  comments: Array<{ name: string; date: string; text: string }>
}

const authorNameById: Record<number, string> = {
  1: 'SAGEC Team',
  2: 'Diane Uwimana',
}

const posts: SeedPost[] = [
  {
    slug: 'signs-your-building-needs-structural-reinforcement',
    title: '5 Signs Your Building Needs Structural Reinforcement',
    excerpt:
      'Cracks in the wall or a sagging floor can mean far more than cosmetic wear. Here are the warning signs worth calling an engineer for.',
    category: 'Construction',
    tags: ['Construction', 'Engineering'],
    authorId: 1,
    publishedAt: '2026-05-15',
    content: [
      {
        type: 'paragraph',
        text: 'Every structure settles and ages over time, but not every sign of wear is harmless. Knowing the difference between normal wear and a genuine structural concern can save a building — and a significant amount of money — before a small issue becomes a major one.',
      },
      { type: 'image', caption: 'A routine structural inspection in progress.' },
      {
        type: 'checklist',
        items: [
          'Diagonal cracks widening near doors and windows',
          'Doors or windows that no longer close properly',
          'Visible sagging in floors or ceilings',
          'Gaps forming between walls and the ceiling',
          'Persistent dampness near foundation walls',
        ],
      },
      { type: 'heading', text: 'Why Early Assessment Matters' },
      {
        type: 'paragraph',
        text: 'The earlier a structural issue is identified, the narrower the range of intervention needed — and the lower the cost. A full structural assessment considers load paths, material condition, and foundation behavior together, not any one symptom in isolation.',
      },
      {
        type: 'quote',
        text: 'A cracked wall is a message, not a verdict. The right response depends entirely on what is causing it.',
        author: 'SAGEC Structural Team',
      },
    ],
    comments: [
      {
        name: 'Isaac Byiringiro',
        date: '2026-05-17',
        text: 'This is really helpful — noticed a small crack near a window frame recently and wasn\u2019t sure if it mattered. Booking an inspection now.',
      },
      {
        name: 'Claudine Ishimwe',
        date: '2026-05-18',
        text: 'Great breakdown. Would love a follow-up post on foundation repair options.',
      },
    ],
  },
  {
    slug: 'future-of-sustainable-construction-in-rwanda',
    title: 'The Future of Sustainable Construction in Rwanda',
    excerpt:
      'From material sourcing to energy-efficient design, sustainable practices are reshaping how buildings are planned across the region.',
    category: 'Sustainability',
    tags: ['Sustainability', 'Architecture'],
    authorId: 2,
    publishedAt: '2026-04-22',
    content: [
      {
        type: 'paragraph',
        text: 'Sustainable construction is no longer a niche request — it is quickly becoming the expectation for commercial and residential clients alike. Locally sourced materials, passive cooling design, and efficient water systems are now standard considerations from the earliest concept stage.',
      },
      { type: 'heading', text: 'Designing With the Climate, Not Against It' },
      {
        type: 'paragraph',
        text: 'Orientation, shading, and natural ventilation can dramatically reduce a building\u2019s long-term energy demand — often at little to no additional construction cost when planned early in the design process.',
      },
      { type: 'gallery', imageCount: 2 },
    ],
    comments: [
      {
        name: 'Robert Twahirwa',
        date: '2026-04-24',
        text: 'Would be great to see a case study of a completed sustainable project in Kigali.',
      },
    ],
  },
  {
    slug: 'why-professional-project-management-saves-you-money',
    title: 'Why Professional Project Management Saves You Money',
    excerpt:
      'Cutting corners on project oversight almost always costs more later. Here is how proper management pays for itself.',
    category: 'Construction',
    tags: ['Project Updates', 'Construction'],
    authorId: 1,
    publishedAt: '2026-03-10',
    content: [
      {
        type: 'paragraph',
        text: 'Construction delays rarely come from a single dramatic failure — they accumulate from small miscommunications, unclear timelines, and reactive decision-making. Professional project management exists to catch these issues before they compound.',
      },
      {
        type: 'checklist',
        items: [
          'Clear scheduling with realistic contingency built in',
          'Coordinated procurement to avoid material delays',
          'Consistent quality checks throughout the build',
          'Transparent client reporting at every milestone',
        ],
      },
      {
        type: 'paragraph',
        text: 'The result is not just a faster project — it is a more predictable one, which is often what clients value most.',
      },
    ],
    comments: [],
  },
  {
    slug: 'interior-design-trends-shaping-modern-kigali-offices',
    title: 'Interior Design Trends Shaping Modern Kigali Offices',
    excerpt:
      'Workspaces are evolving fast. Here is what is defining office interiors across Kigali right now.',
    category: 'Architecture',
    tags: ['Interior Design', 'Architecture'],
    authorId: 2,
    publishedAt: '2026-02-18',
    content: [
      {
        type: 'paragraph',
        text: 'Modern office interiors in Kigali are shifting away from rigid, compartmentalized layouts toward flexible spaces that support both focused work and collaboration.',
      },
      { type: 'image', caption: 'A recently completed office interior fit-out.' },
      {
        type: 'paragraph',
        text: 'Natural materials, warm lighting, and biophilic design elements are increasingly common — reflecting a broader shift toward workspaces that feel considered rather than purely functional.',
      },
    ],
    comments: [
      {
        name: 'Fiona Uwizeye',
        date: '2026-02-20',
        text: 'The biophilic design point really resonates — our office could use more natural light and greenery.',
      },
      {
        name: 'Isaac Byiringiro',
        date: '2026-02-21',
        text: 'Curious how much this typically adds to a fit-out budget.',
      },
    ],
  },
  {
    slug: 'understanding-rwandas-building-compliance-standards',
    title: 'Understanding Rwanda\u2019s Building Compliance Standards',
    excerpt:
      'Navigating regulatory approval can feel complex. Here is a clear overview of what every project needs to account for.',
    category: 'Company News',
    tags: ['Industry Insights', 'Company News'],
    authorId: 1,
    publishedAt: '2026-01-29',
    content: [
      {
        type: 'paragraph',
        text: 'Regulatory compliance is often seen as a hurdle, but it exists to protect the safety and longevity of every structure built. Understanding the requirements early prevents costly redesigns later in a project.',
      },
      { type: 'heading', text: 'What Gets Reviewed' },
      {
        type: 'paragraph',
        text: 'Structural calculations, fire safety provisions, and site-specific environmental factors are typically reviewed before a permit is issued — each requiring coordination between architects, engineers, and the relevant authorities.',
      },
    ],
    comments: [],
  },
  {
    slug: 'how-mep-engineering-prevents-costly-delays',
    title: 'How MEP Engineering Prevents Costly Delays',
    excerpt:
      'Mechanical, electrical, and plumbing coordination is often invisible — until it is not. Here is why it deserves attention early.',
    category: 'Construction',
    tags: ['Engineering', 'Project Updates'],
    authorId: 2,
    publishedAt: '2025-12-05',
    content: [
      {
        type: 'paragraph',
        text: 'MEP systems are among the most coordination-heavy parts of any build. Without early clash detection between mechanical ducting, electrical routing, and plumbing lines, on-site conflicts can halt progress for days.',
      },
      {
        type: 'quote',
        text: 'The projects that stay on schedule are almost always the ones where MEP was planned in parallel with structural design, not after it.',
        author: 'SAGEC MEP Team',
      },
      {
        type: 'paragraph',
        text: 'Investing in proper coordination at the design stage remains one of the most effective ways to protect a project\u2019s timeline.',
      },
    ],
    comments: [
      {
        name: 'Claudine Ishimwe',
        date: '2025-12-08',
        text: 'This matches our experience exactly — clash detection saved us weeks on a recent build.',
      },
    ],
  },
]

function findAssetFile(baseName: string): string | null {
  for (const ext of ALLOWED_EXTENSIONS) {
    const candidate = path.join(ASSETS_DIR, baseName + ext)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

async function run() {
  const payload = await getPayload({ config })
  console.log('Payload initialized.\n')

  // ── Shared fallback placeholder (used for any image not supplied) ──
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

  // Cache of already-resolved real images this run, keyed by baseName,
  // so the same file isn't re-uploaded twice if referenced more than once.
  const resolvedCache = new Map<string, string>()

  async function resolveImage(baseName: string): Promise<string> {
    if (resolvedCache.has(baseName)) return resolvedCache.get(baseName)!

    // Already uploaded in a previous run? Check by alt text (= baseName).
    const existing = (
      await payload.find({ collection: 'media', where: { alt: { equals: baseName } }, limit: 1 })
    ).docs[0]
    if (existing) {
      const id = String(existing.id)
      resolvedCache.set(baseName, id)
      return id
    }

    const filePath = findAssetFile(baseName)
    if (!filePath) {
      console.log(`  (no file found for "${baseName}" — using placeholder)`)
      const id = String(placeholder.id)
      resolvedCache.set(baseName, id)
      return id
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
    const id = String(uploaded.id)
    resolvedCache.set(baseName, id)
    return id
  }

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]
    const postNum = i + 1

    const existing = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`SKIP  "${post.title}" — already exists.`)
      await seedComments(payload, existing.docs[0].id, post)
      continue
    }

    const authorName = authorNameById[post.authorId]
    let authorMatch = await payload.find({
      collection: 'blog-authors',
      where: { name: { equals: authorName } },
      limit: 1,
    })
    if (authorMatch.docs.length === 0) {
      // FIX: previously this skipped the whole post if the author didn't
      // exist yet — silently dropping real content. seed/assets and this
      // script don't create authors ahead of time, so create one on the
      // fly instead (idempotent — next run finds it by name and reuses it).
      console.warn(`WARN  author "${authorName}" not found — creating a placeholder author record for them.`)
      const created = await payload.create({
        collection: 'blog-authors',
        data: {
          name: authorName,
          role: 'Content Contributor',
          bio: `${authorName} contributes articles on architecture, engineering, and construction at SAGEC. Update this bio in the admin panel with their real role and background.`,
        },
      })
      authorMatch = { docs: [created] } as typeof authorMatch
    }
    const authorId = authorMatch.docs[0].id

    const tagIds: string[] = []
    for (const tagName of post.tags) {
      let tagMatch = await payload.find({
        collection: 'tags',
        where: { name: { equals: tagName } },
        limit: 1,
      })
      if (tagMatch.docs.length === 0) {
        // Same fix as authors above — create the tag instead of dropping
        // it from the post. `slug` auto-generates from `name`.
        console.warn(`WARN  tag "${tagName}" not found — creating it.`)
        const created = await payload.create({ collection: 'tags', data: { name: tagName } })
        tagMatch = { docs: [created] } as typeof tagMatch
      }
      tagIds.push(String(tagMatch.docs[0].id))
    }

    const coverImageId = await resolveImage(`blogcover_${postNum}`)

    let inlineIndex = 0
    let galleryIndex = 0
    const contentBlocks = []
    for (const block of post.content as any[]) {
      switch (block.type) {
        case 'paragraph':
          contentBlocks.push({ blockType: 'paragraph', text: block.text })
          break
        case 'heading':
          contentBlocks.push({ blockType: 'heading', text: block.text })
          break
        case 'image': {
          inlineIndex += 1
          const imageId = await resolveImage(`blog_${postNum}_inline_${inlineIndex}`)
          contentBlocks.push({ blockType: 'image', image: imageId, caption: block.caption })
          break
        }
        case 'checklist':
          contentBlocks.push({
            blockType: 'checklist',
            items: block.items.map((text: string) => ({ text })),
          })
          break
        case 'quote':
          contentBlocks.push({ blockType: 'quote', text: block.text, author: block.author })
          break
        case 'gallery': {
          const images = []
          for (let g = 1; g <= (block.imageCount ?? 2); g++) {
            galleryIndex += 1
            const imageId = await resolveImage(`blog_${postNum}_gallery_${galleryIndex}`)
            images.push({ image: imageId })
          }
          contentBlocks.push({ blockType: 'gallery', images })
          break
        }
      }
    }

    try {
      const created = await payload.create({
        collection: 'blog-posts',
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          category: post.category,
          tags: tagIds,
          author: authorId,
          publishedAt: post.publishedAt,
          coverImage: coverImageId,
          content: contentBlocks,
        },
      })
      console.log(`CREATE "${post.title}" ✓`)
      await seedComments(payload, created.id, post)
    } catch (err) {
      console.error(`ERROR  "${post.title}" — failed to create:`, err)
    }
  }

  console.log('\nDone.')
  process.exit(0)
}

async function seedComments(
  payload: any,
  postId: string | number,
  post: { title: string; comments: any[] },
) {
  for (const comment of post.comments) {
    const existing = await payload.find({
      collection: 'blog-comments',
      where: {
        and: [
          { post: { equals: postId } },
          { name: { equals: comment.name } },
          { text: { equals: comment.text } },
        ],
      },
      limit: 1,
    })
    if (existing.docs.length > 0) continue

    try {
      await payload.create({
        collection: 'blog-comments',
        data: {
          post: postId,
          name: comment.name,
          email: 'seed-placeholder@example.com',
          text: comment.text,
          approved: true,
        },
      })
      console.log(`  + comment from ${comment.name}`)
    } catch (err) {
      console.error(`  ! failed to seed comment from ${comment.name}:`, err)
    }
  }
}

run()
