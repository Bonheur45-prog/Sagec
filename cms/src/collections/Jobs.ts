import type { CollectionConfig } from 'payload'

/**
 * Job openings shown on the Careers page.
 *
 * Status controls visibility: only "Open" jobs are returned to the public
 * site. Set a role to "Closed" when it's filled — it disappears from the
 * website but stays here, so it can be reopened later instead of retyped.
 */
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: { singular: 'Job Opening', plural: 'Job Openings' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'department', 'type', 'status', 'order'],
    description:
      'Open roles appear on the Careers page. Set a role to "Closed" to hide it without deleting it.',
  },
  access: {
    // Public visitors only ever see open roles; signed-in admins see all.
    read: ({ req }) => (req.user ? true : { status: { equals: 'open' } }),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 150,
      admin: { description: 'e.g. "Senior Architect"' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'department',
          type: 'select',
          required: true,
          options: [
            'Architecture',
            'Engineering',
            'Project Management',
            'Interior Design',
            'Administration',
          ],
          admin: { width: '50%' },
        },
        {
          name: 'type',
          label: 'Job Type',
          type: 'select',
          required: true,
          defaultValue: 'Full-time',
          options: ['Full-time', 'Part-time', 'Contract', 'Internship'],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      defaultValue: 'Kigali, Rwanda',
    },
    {
      name: 'description',
      label: 'About the Role',
      type: 'textarea',
      required: true,
    },
    {
      name: 'requirements',
      type: 'array',
      labels: { singular: 'Requirement', plural: 'Requirements' },
      admin: { description: 'One requirement per row, shown as a bulleted list.' },
      fields: [{ name: 'requirement', type: 'text', required: true }],
    },
    {
      name: 'applyEmail',
      label: 'Apply Email',
      type: 'email',
      admin: {
        description:
          'Optional. Leave blank to use the default email from Careers Page settings (or Company Info).',
      },
    },
    {
      name: 'applyLink',
      label: 'Apply Online Link',
      type: 'text',
      admin: { description: 'Optional, e.g. a Google Form or job-board listing.' },
      validate: (value: string | null | undefined) =>
        !value || /^https?:\/\/\S+$/i.test(value) || 'Must be a full link starting with https://',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Only open roles appear on the website.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Controls display order on the site (lower numbers first).',
      },
    },
  ],
}
