import type { CollectionConfig } from 'payload'

// Slugify helper — converts "Architectural Design" -> "architectural-design"
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'iconKey', 'order'],
  },
  access: {
    read: () => true, // public — the frontend fetches this without auth
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
        description: 'Auto-generated from the title if left blank. Used in the /services/:slug URL.',
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
      admin: {
        position: 'sidebar',
        description: 'Controls display order on the site (lower numbers first).',
      },
      defaultValue: 0,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short teaser description shown on cards.',
      },
    },
    {
      name: 'iconKey',
      type: 'select',
      required: true,
      options: [
        { label: 'Architecture (Compass)', value: 'architecture' },
        { label: 'Structure (Building2)', value: 'structure' },
        { label: 'MEP (Wrench)', value: 'mep' },
        { label: 'Management (ClipboardList)', value: 'management' },
        { label: 'Construction (HardHat)', value: 'construction' },
        { label: 'Interior (Sofa)', value: 'interior' },
      ],
      admin: {
        description: 'Maps to a fixed icon on the frontend — cannot introduce icons the site doesn\u2019t know how to render.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Card image shown on the Home and Services list pages.',
      },
    },
    {
      name: 'detailImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Larger hero image shown on the individual service detail page.',
      },
    },
    {
      name: 'deliverables',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Deliverable',
        plural: 'Deliverables',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}