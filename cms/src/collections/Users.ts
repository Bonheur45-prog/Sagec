import type { CollectionConfig } from 'payload'

/**
 * Admin accounts. Every signed-in user has full access (single role for
 * now). New users are added from the admin: Users → Create New.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'createdAt'],
    description: 'People who can sign in to this CMS. Add a new person with "Create New".',
  },
  auth: true,
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    // Anyone signed in can remove other accounts, but never their own —
    // stops someone locking themselves (or the last admin) out by mistake.
    delete: ({ req, id }) => Boolean(req.user) && String(req.user?.id) !== String(id),
  },
  fields: [
    // Email + password are added automatically by `auth: true`.
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 120,
    },
  ],
}
