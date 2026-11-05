import type { Field, GlobalConfig } from 'payload'

/**
 * One SEO group per static page. The frontend's <Seo pageKey="..." />
 * reads the matching group; any field left blank falls back to the text
 * written in the page file itself, so an empty entry never breaks a page.
 * Dynamic pages (a single project, service or blog post) build their SEO
 * from their own document, not from here.
 */
const pageSeo = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Browser tab / Google title. "— SAGEC Ltd" is added automatically. Leave blank on Home to use the default site title.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Meta description shown in search results (aim for 150–160 characters).' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Optional social-share image (Open Graph). Blank = the site default.' },
    },
  ],
})

export const SeoSettings: GlobalConfig = {
  slug: 'seo-settings',
  label: 'SEO Settings',
  admin: {
    description: 'Page titles, meta descriptions and social-share images for the main pages.',
  },
  access: {
    read: () => true, // public — the frontend fetches this without auth
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'SAGEC Ltd',
      admin: { description: 'Appended to every page title.' },
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      admin: { description: 'Used on any page that has no description of its own.' },
    },
    {
      name: 'defaultImage',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Default social-share image for pages without their own.' },
    },
    pageSeo('home', 'Home'),
    pageSeo('about', 'About'),
    pageSeo('services', 'Services'),
    pageSeo('projects', 'Projects'),
    pageSeo('testimonials', 'Testimonials'),
    pageSeo('blog', 'Blog'),
    pageSeo('contact', 'Contact'),
  ],
}
