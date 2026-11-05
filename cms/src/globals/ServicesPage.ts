import type { GlobalConfig } from 'payload'

export const ServicesPage: GlobalConfig = {
  slug: 'services-page',
  admin: {
    description: 'Page-level content for the Services page: process steps, the closing CTA, and the "Why Choose Us" list.',
  },
  access: {
    read: () => true, // public — the frontend fetches this without auth
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "SAGEC Expertise"' },
        },
        {
          name: 'headline',
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
          required: true,
        },
      ],
    },
    {
      name: 'processSteps',
      type: 'array',
      label: 'Process Steps',
      admin: {
        description: 'The "How We Work" steps shown on the Services page.',
      },
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g. "01"',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'whyChooseUs',
      type: 'array',
      label: 'Why Choose Us',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'servicesCTA',
      type: 'group',
      label: 'Closing CTA',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'subline',
          type: 'textarea',
          required: true,
        },
        {
          name: 'primaryBtnLabel',
          type: 'text',
          required: true,
        },
        {
          name: 'primaryBtnLink',
          type: 'text',
          required: true,
          admin: {
            description: 'Internal path, e.g. /contact',
          },
        },
        {
          name: 'secondaryBtnLabel',
          type: 'text',
          required: true,
        },
        {
          name: 'secondaryBtnLink',
          type: 'text',
          required: true,
          admin: {
            description: 'Internal path, e.g. /projects',
          },
        },
      ],
    },
  ],
}