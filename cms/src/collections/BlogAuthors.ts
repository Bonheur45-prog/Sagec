import type { CollectionConfig } from 'payload'

export const BlogAuthors: CollectionConfig = {
  slug: 'blog-authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Marketing Lead"',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional — the frontend shows initials if left blank.',
      },
    },
    {
      name: 'socials',
      type: 'array',
      labels: { singular: 'Social Link', plural: 'Social Links' },
      fields: [
        {
          name: 'iconKey',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'X', value: 'x' },
          ],
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}