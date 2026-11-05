import type { CollectionConfig } from 'payload'

export const BlogComments: CollectionConfig = {
  slug: 'blog-comments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'post', 'approved', 'createdAt'],
    description: 'Public visitors can submit comments (unauthenticated). New comments start unapproved and are hidden from public view until approved here.',
  },
  access: {
    // Public visitors can create comments — this is the intentional
    // "let people submit without an account" behavior we agreed on.
    create: () => true,

    // Public reads only see approved comments. An authenticated admin
    // (viewing in the dashboard, or hitting the API while logged in)
    // sees everything, approved or not — needed for moderation.
    read: ({ req }) => {
      if (req.user) return true
      return { approved: { equals: true } }
    },

    // Only authenticated admins can approve/edit/delete comments.
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'blog-posts',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      access: {
        // Never exposed in public API responses — visible to admins only.
        // Collected for moderation contact purposes, not displayed on the site.
        read: ({ req }) => Boolean(req.user),
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Optional, matches the original comment form field.',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional — the frontend shows initials if left blank. Public commenters won\u2019t have a way to upload one; this is mainly for comments you add manually.',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Comment is hidden from the public site until this is checked.',
      },
    },
  ],
}