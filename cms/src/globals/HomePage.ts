import type { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  admin: {
    description: 'All homepage-specific content: Hero slides, Stats, and the copy for the Services/Projects/Testimonials teasers and closing CTA. The actual Services/Projects/Testimonials items themselves live in their own collections, not here.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        {
          name: 'slides',
          type: 'array',
          minRows: 1,
          admin: {
            description: 'Background rotation. Each slide is either a video or an image — pick the type, then fill in the matching field below it.',
          },
          fields: [
            {
              name: 'type',
              type: 'select',
              required: true,
              defaultValue: 'image',
              options: ['image', 'video'],
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image' } },
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'image',
              },
            },
            {
              name: 'video',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'video' } },
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'video',
                description: 'Requires video mimeTypes to be allowed on the Media collection — see note below.',
              },
            },
            {
              name: 'poster',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image' } },
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'video',
                description: 'Shown before the video loads/plays.',
              },
            },
            { name: 'headline', type: 'text', required: true },
            { name: 'subline', type: 'textarea', required: true },
            {
              name: 'duration',
              type: 'number',
              defaultValue: 7000,
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'image',
                description: 'Milliseconds shown before auto-advancing (image slides only — video slides advance when the video ends).',
              },
            },
          ],
        },
        {
          name: 'foreground',
          type: 'group',
          label: 'Foreground Worker Image',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true, filterOptions: { mimeType: { contains: 'image' } } },
            { name: 'alt', type: 'text', required: true },
          ],
        },
        { name: 'primaryBtnLabel', type: 'text', required: true },
        { name: 'primaryBtnLink', type: 'text', required: true },
        { name: 'secondaryBtnLabel', type: 'text', required: true },
        { name: 'secondaryBtnLink', type: 'text', required: true },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'supportingText', type: 'textarea', required: true },
        {
          name: 'items',
          type: 'array',
          minRows: 1,
          maxRows: 4,
          fields: [
            {
              name: 'iconKey',
              type: 'select',
              required: true,
              options: [
                { label: 'Years (Clock)', value: 'years' },
                { label: 'Projects (Building2)', value: 'projects' },
                { label: 'Clients (Users)', value: 'clients' },
                { label: 'Location (MapPin)', value: 'location' },
              ],
            },
            {
              name: 'value',
              type: 'number',
              admin: {
                description: 'Leave blank for a non-numeric stat (e.g. a location name) and use Text below instead.',
              },
            },
            {
              name: 'text',
              type: 'text',
              admin: {
                description: 'Only used when Value is left blank, e.g. "Kigali".',
              },
            },
            { name: 'suffix', type: 'text', admin: { description: 'e.g. "+"' } },
            { name: 'label', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      name: 'servicesTeaser',
      type: 'group',
      label: 'Services Teaser Copy',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'viewAllLabel', type: 'text', required: true },
        { name: 'viewAllLink', type: 'text', required: true },
      ],
    },
    {
      name: 'projectsTeaser',
      type: 'group',
      label: 'Projects Teaser Copy',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'headingStart', type: 'text', required: true },
        { name: 'headingHighlight', type: 'text', required: true },
        { name: 'subtext', type: 'textarea', required: true },
        { name: 'viewAllLabel', type: 'text', required: true },
        { name: 'viewAllLink', type: 'text', required: true },
      ],
    },
    {
      name: 'testimonialsTeaser',
      type: 'group',
      label: 'Testimonials Teaser Copy',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'partnersSection',
      type: 'group',
      label: 'Partners Section Copy',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'whyChooseUs',
      type: 'group',
      label: 'Why Choose Us Section',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'headingStart', type: 'text', required: true, admin: { description: 'e.g. "Built on" (non-highlighted part)' } },
        { name: 'headingHighlight', type: 'text', required: true, admin: { description: 'e.g. "Trust" (shown in gold)' } },
        { name: 'headingEnd', type: 'text', required: true, admin: { description: 'e.g. "Delivered with Precision"' } },
        { name: 'subtext', type: 'textarea', required: true },
        {
          name: 'reasons',
          type: 'array',
          minRows: 1,
          maxRows: 8,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
          ],
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: { mimeType: { contains: 'image' } },
          admin: { description: 'Parallax background behind the section.' },
        },
        {
          name: 'media',
          type: 'group',
          label: 'Right Column Media',
          fields: [
            { name: 'type', type: 'select', required: true, defaultValue: 'image', options: ['image', 'video'] },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image' } },
              admin: { condition: (_, siblingData) => siblingData?.type === 'image' },
            },
            {
              name: 'video',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'video' } },
              admin: { condition: (_, siblingData) => siblingData?.type === 'video' },
            },
            { name: 'alt', type: 'text' },
          ],
        },
        { name: 'ctaLabel', type: 'text', required: true },
        { name: 'ctaLink', type: 'text', required: true, admin: { description: 'Internal path, e.g. /about' } },
      ],
    },
    {
      name: 'partnersTeaser',
      type: 'group',
      label: 'Partners Strip',
      admin: { description: 'Heading above the partner logos on the home page. Logos are managed in the Partners collection; the strip is hidden when there are none.' },
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Trusted By' },
        { name: 'heading', type: 'text', defaultValue: 'Our Partners' },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Closing CTA',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'headingStart', type: 'text', required: true },
        { name: 'headingHighlight', type: 'text', required: true },
        { name: 'headingEnd', type: 'text', required: true },
        { name: 'subline', type: 'textarea', required: true },
        { name: 'primaryBtnLabel', type: 'text', required: true },
        { name: 'primaryBtnLink', type: 'text', required: true },
        { name: 'secondaryBtnLabel', type: 'text', required: true },
        { name: 'secondaryBtnLink', type: 'text', required: true },
      ],
    },
  ],
}