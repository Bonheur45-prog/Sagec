import type { GlobalConfig } from 'payload'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  admin: {
    description: 'All content for the About page: story, mission/vision, core values, timeline, and closing CTA.',
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
        { name: 'backgroundImage', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'story',
      type: 'group',
      label: 'Our Story',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        {
          name: 'paragraphs',
          type: 'array',
          minRows: 1,
          labels: { singular: 'Paragraph', plural: 'Paragraphs' },
          fields: [{ name: 'text', type: 'textarea', required: true }],
        },
        { name: 'quote', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'imageAlt',
          type: 'text',
          required: true,
          admin: { description: 'Accessibility description of the image.' },
        },
      ],
    },
    {
      name: 'missionVisionEyebrow',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Who We Are"' },
    },
    {
      name: 'missionVisionHeadingStart',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Our" (the non-highlighted part)' },
    },
    {
      name: 'missionVisionHeadingHighlight',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Purpose" (shown in gold)' },
    },
    {
      name: 'missionVision',
      type: 'group',
      label: 'Mission & Vision',
      fields: [
        {
          name: 'mission',
          type: 'group',
          fields: [
            { name: 'eyebrow', type: 'text', required: true },
            { name: 'heading', type: 'text', required: true },
            { name: 'text', type: 'textarea', required: true },
          ],
        },
        {
          name: 'vision',
          type: 'group',
          fields: [
            { name: 'eyebrow', type: 'text', required: true },
            { name: 'heading', type: 'text', required: true },
            { name: 'text', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      name: 'coreValuesEyebrow',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "What Drives Us"' },
    },
    {
      name: 'coreValuesHeading',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Our Core Values"' },
    },
    {
      name: 'coreValues',
      type: 'array',
      label: 'Core Values',
      minRows: 1,
      fields: [
        {
          name: 'iconKey',
          type: 'select',
          required: true,
          options: [
            { label: 'Quality (Award)', value: 'quality' },
            { label: 'Innovation (Lightbulb)', value: 'innovation' },
            { label: 'Integrity (ShieldCheck)', value: 'integrity' },
            { label: 'Sustainability (Leaf)', value: 'sustainability' },
          ],
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'timelineEyebrow',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Our Journey"' },
    },
    {
      name: 'timelineHeading',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Milestones That Define Us"' },
    },
    {
      name: 'timelineBackgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Parallax background behind the timeline.' },
    },
    {
      name: 'milestones',
      type: 'array',
      label: 'Timeline Milestones',
      minRows: 1,
      admin: {
        description: 'Displayed in array order — drag to reorder here, no separate order field needed.',
      },
      fields: [
        { name: 'year', type: 'text', required: true },
        { name: 'badge', type: 'text', required: true, admin: { description: 'e.g. "Founded", "Milestone", "In Progress"' } },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'aboutCTA',
      type: 'group',
      label: 'Closing CTA',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'subline', type: 'textarea', required: true },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
        { name: 'primaryBtnLabel', type: 'text', required: true },
        { name: 'primaryBtnLink', type: 'text', required: true, admin: { description: 'Internal path, e.g. /contact' } },
        { name: 'secondaryBtnLabel', type: 'text', required: true },
        { name: 'secondaryBtnLink', type: 'text', required: true, admin: { description: 'Internal path, e.g. /projects' } },
      ],
    },
  ],
}