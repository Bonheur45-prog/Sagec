import type { CollectionConfig } from 'payload'

/**
 * Messages sent through the website's contact form. The form also sends
 * an email (EmailJS); this collection keeps a copy in the admin so
 * enquiries can't be lost and can be tracked (new / read / replied).
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Contact Submission', plural: 'Contact Submissions' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'name', 'email', 'status', 'createdAt'],
    description: 'Messages received from the website contact form.',
  },
  access: {
    // Anyone can submit the form (no account needed)...
    create: () => true,
    // ...but only signed-in admins can read, update or delete submissions.
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 200 },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', maxLength: 50 },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'personal',
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Company', value: 'company' },
      ],
    },
    { name: 'organisation', type: 'text', maxLength: 200 },
    { name: 'subject', type: 'text', required: true, maxLength: 300 },
    { name: 'message', type: 'textarea', required: true, maxLength: 5000 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
        { label: 'Replied', value: 'replied' },
      ],
      admin: { position: 'sidebar' },
      access: {
        // A visitor can't choose their own status — it always starts as "new".
        create: ({ req }) => Boolean(req.user),
      },
    },
  ],
}
