import type { GlobalConfig } from 'payload'

export const ProjectsPage: GlobalConfig = {
  slug: 'projects-page',
  admin: {
    description: 'Page-level content for the Projects page: hero copy, empty-state message, detail-page section labels, and the closing CTA.',
  },
  access: {
    read: () => true, // public — the frontend fetches this without auth
  },
  fields: [
    {
      name: 'projectsHero',
      type: 'group',
      label: 'Hero',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: true,
        },
        {
          name: 'headlineLine1',
          type: 'text',
          required: true,
        },
        {
          name: 'headlineLine2',
          type: 'text',
          admin: {
            description: 'Optional SHORT second line of the big headline (a few words). Leave blank for a one-line headline. Put any longer sentence in "Subline" below — a long sentence here is shown as the subline automatically.',
          },
        },
        {
          name: 'subline',
          type: 'textarea',
          required: true,
          admin: { description: 'The sentence shown under the headline.' },
        },
      ],
    },
    {
      name: 'projectsStats',
      type: 'array',
      label: 'Stats Strip',
      maxRows: 6,
      admin: {
        description: 'The counters under the Projects hero. Use a Number for a counting-up stat (e.g. 30 + "+"), or fill Text to show words instead (e.g. "Kigali").',
      },
      defaultValue: [
        { value: 10, suffix: '+', label: 'Years Experience' },
        { value: 30, suffix: '+', label: 'Projects Completed' },
        { value: 50, suffix: '+', label: 'Happy Clients' },
        { text: 'Kigali', label: 'Rwanda' },
      ],
      fields: [
        { name: 'value', type: 'number' },
        { name: 'suffix', type: 'text', admin: { description: 'e.g. + or %' } },
        { name: 'text', type: 'text', admin: { description: 'If set, shown instead of the number.' } },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'projectsEmptyMessage',
      type: 'text',
      required: true,
      admin: {
        description: 'Shown when a category filter matches no projects.',
      },
    },
    {
      name: 'projectDetailLabels',
      type: 'group',
      label: 'Detail Page Section Labels',
      fields: [
        { name: 'overviewHeading', type: 'text', required: true },
        { name: 'servicesHeading', type: 'text', required: true },
        { name: 'specsHeading', type: 'text', required: true },
        { name: 'galleryHeading', type: 'text', required: true },
        { name: 'relatedHeading', type: 'text', required: true },
        { name: 'ctaLabel', type: 'text', required: true, admin: { description: 'The words on the button at the bottom of a project page (e.g. "Contact"). The button always links to /contact — type the label here, not the link.' } },
      ],
    },
    {
      name: 'projectsCTA',
      type: 'group',
      label: 'Closing CTA',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'subline', type: 'textarea', required: true },
        { name: 'primaryBtnLabel', type: 'text', required: true },
        {
          name: 'primaryBtnLink',
          type: 'text',
          required: true,
          admin: { description: 'Internal path, e.g. /contact' },
        },
        { name: 'secondaryBtnLabel', type: 'text', required: true },
        {
          name: 'secondaryBtnLink',
          type: 'text',
          required: true,
          admin: { description: 'Internal path, e.g. /services' },
        },
      ],
    },
  ],
}