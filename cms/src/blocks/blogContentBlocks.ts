import type { Block } from 'payload'

export const ParagraphBlock: Block = {
  slug: 'paragraph',
  labels: { singular: 'Paragraph', plural: 'Paragraphs' },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
  ],
}

export const HeadingBlock: Block = {
  slug: 'heading',
  labels: { singular: 'Heading', plural: 'Headings' },
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
  ],
}

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}

export const ChecklistBlock: Block = {
  slug: 'checklist',
  labels: { singular: 'Checklist', plural: 'Checklists' },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Item', plural: 'Items' },
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

export const QuoteBlock: Block = {
  slug: 'quote',
  labels: { singular: 'Quote', plural: 'Quotes' },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        description: 'Optional — e.g. "SAGEC Structural Team"',
      },
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Image', plural: 'Images' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}

// Matches the 6 cases in the frontend's ContentBlock renderer exactly —
// if a 7th block type is ever added, it needs to be added in both places.
export const blogContentBlocks: Block[] = [
  ParagraphBlock,
  HeadingBlock,
  ImageBlock,
  ChecklistBlock,
  QuoteBlock,
  GalleryBlock,
]