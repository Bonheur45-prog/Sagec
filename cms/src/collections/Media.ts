import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Generates resized variants on upload so the site never has to ship
    // a full original-resolution photo just to render a small card or
    // slider thumbnail. Existing (already-uploaded) media won't have
    // these until re-uploaded — new uploads get them automatically.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'tablet', width: 1200, height: undefined },
    ],
    // Keep the original too (used for hero backgrounds / full detail views).
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
}
