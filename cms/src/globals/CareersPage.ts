import type { GlobalConfig } from 'payload'

export const CareersPage: GlobalConfig = {
  slug: 'careers-page',
  admin: {
    description: 'Page-level copy for the Careers page. The jobs themselves live in "Job Openings".',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        {
          name: 'headline',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "Build Rwanda’s Future With Us"' },
        },
        {
          name: 'headlineHighlight',
          type: 'text',
          admin: {
            description:
              'Optional — a word from the headline to show in orange, e.g. "Future". Must match the headline exactly.',
          },
        },
        { name: 'subline', type: 'textarea', required: true },
      ],
    },
    {
      type: 'collapsible',
      label: 'How to Apply',
      fields: [
        {
          name: 'applyInstructions',
          type: 'textarea',
          required: true,
          admin: { description: 'Shown inside every job’s details window.' },
        },
        {
          name: 'defaultApplyEmail',
          type: 'email',
          admin: {
            description:
              'Used for any job without its own Apply Email. Blank = the email in Company Info.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'When there are no open roles',
      fields: [
        { name: 'noJobsHeading', type: 'text', required: true },
        { name: 'noJobsText', type: 'textarea', required: true },
      ],
    },
  ],
}
