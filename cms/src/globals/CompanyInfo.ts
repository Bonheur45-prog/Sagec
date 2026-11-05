import type { GlobalConfig } from 'payload'

export const CompanyInfo: GlobalConfig = {
  slug: 'company-info',
  admin: {
    description: 'Single source of truth for contact details — feeds the Footer, HomeCTA, and Contact page. Previously duplicated across company.js and contact.js with conflicting values; this Global replaces both.',
  },
  access: {
    read: () => true, // public — the frontend fetches this without auth
  },
  fields: [
    {
      name: 'tagline',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short brand line shown under the logo in the Footer.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "+250 700 000 000". The tel: link is derived from this on the frontend, not stored separately.',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "KG 7 Ave, Kigali, Rwanda"',
      },
    },
    {
      name: 'whatsappNumber',
      type: 'text',
      admin: {
        description: 'Digits only, no + or spaces, e.g. "250788123456"',
      },
    },
    {
      name: 'whatsappLabel',
      type: 'text',
      defaultValue: 'Chat on WhatsApp',
    },
    {
      name: 'responseNote',
      type: 'text',
      admin: {
        description: 'e.g. "We typically respond within 24 hours during business days."',
      },
    },
    {
      name: 'businessHours',
      type: 'array',
      labels: { singular: 'Business Hours Row', plural: 'Business Hours Rows' },
      fields: [
        {
          name: 'day',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "Monday \u2013 Friday"' },
        },
        {
          name: 'hours',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "8:00 AM \u2013 6:00 PM" or "Closed"' },
        },
      ],
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