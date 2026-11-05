import type { CollectionConfig } from 'payload'
import { blogContentBlocks } from '../blocks/blogContentBlocks'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt'],
  },
  access: {
    read: () => true,
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
        description: 'Auto-generated from the title if left blank. Used in the /blog/:slug URL.',
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
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['Construction', 'Architecture', 'Sustainability', 'Company News', 'Engineering', 'Interior Design', 'Projects', 'News'],
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'blog-authors',
      hasMany: false,
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short teaser shown on the Blog grid card.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'content',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: blogContentBlocks,
      admin: {
        description: 'Build the article body by adding paragraph, heading, image, checklist, quote, and gallery blocks in any order.',
      },
    },
  ],
}