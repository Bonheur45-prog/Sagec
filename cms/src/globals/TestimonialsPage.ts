import type { GlobalConfig } from 'payload'

export const TestimonialsPage: GlobalConfig = {
  slug: 'testimonials-page',
  admin: {
    description: 'Page-level hero copy for the Testimonials page.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      required: true,
    },
    {
      name: 'headlineLine1',
      type: 'text',
      required: true,
    },
    {
      name: 'headlineLine2',
      type: 'text',
      required: true,
    },
    {
      name: 'subline',
      type: 'textarea',
      required: true,
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: {
        description: 'Optional photo behind the hero text (a dark overlay is added automatically). Blank = the default banner image.',
      },
    },
  ],
}