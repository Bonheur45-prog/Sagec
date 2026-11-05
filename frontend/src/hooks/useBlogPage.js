import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchGlobal } from '@lib/api'

export const blogPageQuery = () =>
  queryOptions({
    queryKey: ['blog-page'],
    queryFn: () => fetchGlobal('blog-page', '?depth=1'),
    // Labels have built-in fallbacks (see BLOG_COPY below), so a failed
    // fetch should never raise an error toast.
  })

/**
 * Original wording for every blog label. Used whenever the CMS field is
 * blank or the Blog Page global hasn't loaded / been saved yet.
 */
export const BLOG_COPY = {
  hero: {
    title: 'Ideas That Shape Rwanda',
    breadcrumbLabel: 'Blog',
    backgroundImage: '/images/blog/hero-banner.jpg',
  },
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
}

/**
 * One group of blog copy ('hero' | 'grid' | 'post'), CMS values merged
 * over the fallbacks field by field — a blank CMS field keeps its default.
 */
export function useBlogCopy(group) {
  const { data } = useQuery({
    ...blogPageQuery(),
    select: (page) => page?.[group],
  })
  const merged = { ...BLOG_COPY[group] }
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined && value !== '') merged[key] = value
    }
  }
  return merged
}
