import type { GlobalConfig } from 'payload'

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  admin: {
    description: 'Page-level copy for the Contact page. Actual phone/email/address/hours come from the CompanyInfo global, not repeated here.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'headline', type: 'text', required: true },
        { name: 'subline', type: 'textarea', required: true },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'infoSection',
      type: 'group',
      label: 'Contact Info Section Header',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
      ],
    },
    {
      name: 'form',
      type: 'group',
      label: 'Contact Form Copy',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'nameLabel', type: 'text', required: true },
        { name: 'namePlaceholder', type: 'text' },
        { name: 'emailLabel', type: 'text', required: true },
        { name: 'emailPlaceholder', type: 'text' },
        { name: 'phoneLabel', type: 'text', required: true },
        { name: 'phonePlaceholder', type: 'text' },
        { name: 'messageLabel', type: 'text', required: true },
        { name: 'messagePlaceholder', type: 'text' },
        { name: 'submitLabel', type: 'text', required: true },
        { name: 'submitLoadingLabel', type: 'text', required: true },
        { name: 'successMessage', type: 'text', required: true },
        { name: 'errorMessage', type: 'text', required: true },
        { name: 'validationNameRequired', type: 'text', required: true },
        { name: 'validationEmailRequired', type: 'text', required: true },
        { name: 'validationEmailInvalid', type: 'text', required: true },
        { name: 'validationPhoneRequired', type: 'text', required: true },
        { name: 'validationMessageRequired', type: 'text', required: true },
      ],
    },
    {
      name: 'map',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text', required: true },
        {
          name: 'embedSrc',
          type: 'textarea',
          required: true,
          admin: { description: 'The Google Maps embed URL.' },
        },
        { name: 'directionsLink', type: 'text', required: true },
        { name: 'directionsLabel', type: 'text', required: true },
      ],
    },
  ],
}