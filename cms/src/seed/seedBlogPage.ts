/**
 * SEED: Blog Page Global
 * Run with: npm run seed:blog-page
 *
 * Saves the blog labels that used to live in the frontend's data/blog
 * files (the field defaults in the admin match them). Skipped if the
 * global already has content.
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

  const current = await payload.findGlobal({ slug: 'blog-page' })
  if (current?.hero?.title) {
    console.log('Blog Page already has content (hero.title is set) — skipping to avoid overwriting your edits.')
    process.exit(0)
  }

  await payload.updateGlobal({
    slug: 'blog-page',
    data: {
      hero: { title: 'Ideas That Shape Rwanda', breadcrumbLabel: 'Blog' },
      grid: {
        eyebrow: 'News & Insights',
        heading: 'Read Our Latest Articles',
        noResultsText: 'No articles match your search.',
        searchPlaceholder: 'Search here...',
        popularPostsLabel: 'Popular Posts',
        popularTagsLabel: 'Popular Tags',
      },
      post: {
        heroTitle: 'Blog Details',
        breadcrumbParentLabel: 'Blog',
        notFoundText: "Sorry, we couldn't find that article.",
        backToBlogLabel: 'Back to News & Insights',
        shareLabel: 'Share:',
        relatedPostsLabel: 'More Articles',
        commentsLabel: 'Comments',
        leaveCommentLabel: 'Leave a Comment',
        commentFormDisclaimer: 'Comments are reviewed before appearing publicly.',
        commentNameLabel: 'Your Name',
        commentEmailLabel: 'Email Address',
        commentWebsiteLabel: 'Website (optional)',
        commentMessageLabel: 'Your Comment',
        commentSubmitLabel: 'Post Comment',
      },
    },
  })

  console.log('Blog Page Global seeded ✓')
  process.exit(0)
}

run()
