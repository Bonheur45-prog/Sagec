import type { GlobalConfig } from 'payload'

/**
 * Page-level copy for the Blog list page and the single-post page
 * (hero banners, section headings, sidebar labels, comment form text).
 * Every field is optional: the frontend keeps its original wording as a
 * fallback, so a blank field simply shows the default.
 */
export const BlogPage: GlobalConfig = {
  slug: 'blog-page',
  label: 'Blog Page',
  admin: {
    description: 'Hero, headings and labels for the Blog list page and blog post pages.',
  },
  access: {
    read: () => true, // public — the frontend fetches this without auth
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Blog List Hero',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Ideas That Shape Rwanda' },
        { name: 'breadcrumbLabel', type: 'text', defaultValue: 'Blog' },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          filterOptions: { mimeType: { contains: 'image' } },
          admin: { description: 'Optional. Blank = the default banner image.' },
        },
      ],
    },
    {
      name: 'grid',
      type: 'group',
      label: 'Blog List Section & Sidebar',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'News & Insights' },
        { name: 'heading', type: 'text', defaultValue: 'Read Our Latest Articles' },
        { name: 'noResultsText', type: 'text', defaultValue: 'No articles match your search.' },
        { name: 'searchPlaceholder', type: 'text', defaultValue: 'Search here...' },
        { name: 'popularPostsLabel', type: 'text', defaultValue: 'Popular Posts' },
        { name: 'popularTagsLabel', type: 'text', defaultValue: 'Popular Tags' },
      ],
    },
    {
      name: 'post',
      type: 'group',
      label: 'Blog Post Page',
      fields: [
        { name: 'heroTitle', type: 'text', defaultValue: 'Blog Details', admin: { description: 'Shown while a post is loading.' } },
        { name: 'breadcrumbParentLabel', type: 'text', defaultValue: 'Blog' },
        { name: 'notFoundText', type: 'text', defaultValue: "Sorry, we couldn't find that article." },
        { name: 'backToBlogLabel', type: 'text', defaultValue: 'Back to News & Insights' },
        { name: 'shareLabel', type: 'text', defaultValue: 'Share:' },
        { name: 'relatedPostsLabel', type: 'text', defaultValue: 'More Articles' },
        { name: 'commentsLabel', type: 'text', defaultValue: 'Comments' },
        { name: 'leaveCommentLabel', type: 'text', defaultValue: 'Leave a Comment' },
        { name: 'commentFormDisclaimer', type: 'text', defaultValue: 'Comments are reviewed before appearing publicly.' },
        { name: 'commentNameLabel', type: 'text', defaultValue: 'Your Name' },
        { name: 'commentEmailLabel', type: 'text', defaultValue: 'Email Address' },
        { name: 'commentWebsiteLabel', type: 'text', defaultValue: 'Website (optional)' },
        { name: 'commentMessageLabel', type: 'text', defaultValue: 'Your Comment' },
        { name: 'commentSubmitLabel', type: 'text', defaultValue: 'Post Comment' },
      ],
    },
  ],
}
