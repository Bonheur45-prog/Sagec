import type { CollectionConfig } from 'payload'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', 'order'],
  },
  access: {
    read: () => true, // public — the frontend fetches this without auth
  },
  hooks: {
    afterChange: [
      // Keeps "featured" to a single project at a time — if this doc was
      // just marked featured, un-feature every other project. Runs after
      // save (afterChange, not beforeChange) so the doc already has an id
      // to exclude from the bulk update on both create and update.
      async ({ doc, req, operation }) => {
        if (operation !== 'create' && operation !== 'update') return
        if (!doc.featured) return

        await req.payload.update({
          collection: 'projects',
          where: {
            and: [{ featured: { equals: true } }, { id: { not_equals: doc.id } }],
          },
          data: { featured: false },
          req,
        })
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from the title if left blank. Used in the /projects/:slug URL.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            if (data?.title) return slugify(data.title)
            return value
          },
        ],
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
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Only one project can be featured at a time — marking this one un-features any other automatically.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['Commercial', 'Residential', 'Interior Design', 'Infrastructure', 'Institutional/Civic'],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'Completed',
      options: ['Completed', 'In Progress'],
    },
    {
      name: 'year',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "2024"',
      },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Kigali, Rwanda"',
      },
    },
    {
      name: 'client',
      type: 'text',
      required: true,
    },
    {
      name: 'area',
      type: 'text',
      admin: {
        description: 'e.g. "4,200 sqm"',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short teaser shown on project cards.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Longer body text shown on the project detail page.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Used on the Projects page grid card.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Used in the large hero card (Home + top of Projects page) when this project is featured.',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      labels: { singular: 'Gallery Image', plural: 'Gallery Images' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        description: 'Which services were delivered on this project — pulled from the real Services collection.',
      },
    },
  ],
}