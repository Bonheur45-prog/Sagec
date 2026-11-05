/**
 * PROJECTS DATA
 * ─────────────────────────────────────────────────────────────
 * Used on: Projects page grid, Featured section,
 *          ProjectDetailPage (/projects/:slug),
 *          HomePage Featured Projects section
 *
 * images:       place files at /public/images/projects/
 * coverImage:   main image shown on the grid card
 * featuredImage: large image used in the Featured section
 * gallery:      array of images for the detail page slider
 * ─────────────────────────────────────────────────────────────
 */

export const projects = [
  {
    id: 1,
    slug: 'silverback-mall',
    title: 'Silverback Mall',
    category: 'Commercial',
    year: '20XX',
    location: 'Kigali, Rwanda',
    client: 'Placeholder Client',
    area: 'X,XXX sqm',
    status: 'Completed',
    featured: true,
    shortDescription:
      'One of Kigali\'s most recognised commercial destinations — a landmark retail and entertainment complex that redefined the city\'s commercial landscape.',
    description:
      'Silverback Mall stands as one of SAGEC\'s most defining achievements. Conceived as a landmark commercial destination in Kigali, the project demanded precision across architectural design, structural engineering, MEP systems, and full construction management. The result is a vibrant retail and entertainment hub that has become a cornerstone of Kigali\'s urban identity.',
    coverImage:   '/images/projects/silverback-mall/cover.webp',
    featuredImage: '/images/projects/silverback-mall/featured.jpg',
    gallery: [
      '/images/projects/silverback-mall/gallery-1.jpg',
      '/images/projects/silverback-mall/gallery-2.jpg',
      '/images/projects/silverback-mall/gallery-3.jpg',
      '/images/projects/silverback-mall/gallery-4.jpg',
    ],
    services: ['Architectural Design', 'Structural Engineering', 'MEP Engineering', 'Construction Management'],
    specs: {
      Location: 'Kigali, Rwanda',
      Year:     '20XX',
      Category: 'Commercial',
      Client:   'Placeholder Client',
      Area:     'X,XXX sqm',
      Status:   'Completed',
    },
  },
  {
    id: 2,
    slug: 'florida-house',
    title: 'Florida House',
    category: 'Commercial',
    year: '20XX',
    location: 'Kigali, Rwanda',
    client: 'Placeholder Client',
    area: 'X,XXX sqm',
    status: 'Completed',
    featured: false,
    shortDescription:
      'A premium mixed-use development near City Tower — raising the standard for urban architecture and commercial space in central Kigali.',
    description:
      'Florida House is a testament to SAGEC\'s ability to deliver complex, multi-use developments in the heart of Kigali. Located near City Tower, the project combines commercial and office space within a sophisticated architectural envelope, demanding close coordination across all engineering disciplines.',
    coverImage:    '/images/projects/florida-house/cover.jpeg',
    featuredImage: '/images/projects/florida-house/featured.jpeg',
    gallery: [
      '/images/projects/florida-house/gallery-1.jpeg',
      '/images/projects/florida-house/gallery-2.jpeg',
      '/images/projects/florida-house/gallery-3.jpeg',
      '/images/projects/florida-house/gallery-4.jpeg',
    ],
    services: ['Architectural Design', 'Structural Engineering', 'Project Management'],
    specs: {
      Location: 'Near City Tower, Kigali',
      Year:     '20XX',
      Category: 'Commercial',
      Client:   'Placeholder Client',
      Area:     'X,XXX sqm',
      Status:   'Completed',
    },
  },
  {
    id: 3,
    slug: 'lemigo-hotel-interior',
    title: 'Lemigo Hotel',
    category: 'Interior Design',
    year: '20XX',
    location: 'Kigali, Rwanda',
    client: 'Lemigo Hotel',
    area: 'X,XXX sqm',
    status: 'Completed',
    featured: false,
    shortDescription:
      'A full interior design commission for one of Kigali\'s premier hotels — blending luxury, warmth, and African identity into every space.',
    description:
      'The Lemigo Hotel interior design project showcases SAGEC\'s depth in hospitality environments. Tasked with creating a refined, welcoming atmosphere that reflects both international luxury standards and Rwandan identity, SAGEC delivered a complete interior solution — from concept boards and space planning through to material specification and installation supervision.',
    coverImage:    '/images/projects/lemigo-hotel/cover.jpeg',
    featuredImage: '/images/projects/lemigo-hotel/featured.jpeg',
    gallery: [
      '/images/projects/lemigo-hotel/gallery-1.jpeg',
      '/images/projects/lemigo-hotel/gallery-2.jpeg',
      '/images/projects/lemigo-hotel/gallery-3.jpeg',
    ],
    services: ['Interior Design'],
    specs: {
      Location: 'Kigali, Rwanda',
      Year:     '20XX',
      Category: 'Interior Design',
      Client:   'Lemigo Hotel',
      Area:     'X,XXX sqm',
      Status:   'Completed',
    },
  },
  {
    id: 4,
    slug: 'tcb-house',
    title: 'TCB House',
    category: 'Infrastructure',
    year: '20XX',
    location: 'Kigali, Rwanda',
    client: 'Rwanda Governance Board',
    area: 'X,XXX sqm',
    status: 'In Progress',
    featured: false,
    shortDescription:
      'A prestigious government commission near Remera Stadium — delivering a landmark public building for the Rwanda Governance Board.',
    description:
      'The TCB House represents SAGEC\'s growing portfolio of government and institutional projects. Located near Remera Stadium, this commission for the Rwanda Governance Board demands the highest standards of structural engineering, MEP coordination, and construction management. The project is currently under construction and represents one of SAGEC\'s most significant public sector commissions to date.',
    coverImage:    '/images/projects/tcb-house/cover.jpeg',
    featuredImage: '/images/projects/tcb-house/featured.jpeg',
    gallery: [
      '/images/projects/tcb-house/gallery-1.jpeg',
      '/images/projects/tcb-house/gallery-2.jpeg',
    ],
    services: ['Structural Engineering', 'MEP Engineering', 'Construction Management', 'Project Management'],
    specs: {
      Location: 'Kigali, Rwanda',
      Year:     '20XX',
      Category: 'Infrastructure',
      Client:   'Rwanda Governance Board',
      Area:     'X,XXX sqm',
      Status:   'In Progress',
    },
  },
  {
    id: 5,
    slug: 'placeholder-residential',
    title: 'Residential Project',
    category: 'Residential',
    year: '20XX',
    location: 'Kigali, Rwanda',
    client: 'Placeholder Client',
    area: 'X,XXX sqm',
    status: 'Completed',
    featured: false,
    shortDescription:
      'A premium residential development delivering modern living spaces designed for comfort, elegance, and lasting quality.',
    description:
      'Placeholder — replace with real project details when ready.',
    coverImage:    '/images/projects/placeholder-residential/cover.jpg',
    featuredImage: '/images/projects/placeholder-residential/featured.jpg',
    gallery: [
      '/images/projects/placeholder-residential/gallery-1.jpg',
    ],
    services: ['Architectural Design', 'Structural Engineering'],
    specs: {
      Location: 'Kigali, Rwanda',
      Year:     '20XX',
      Category: 'Residential',
      Client:   'Placeholder Client',
      Area:     'X,XXX sqm',
      Status:   'Completed',
    },
  },
  {
    id: 6,
    slug: 'placeholder-infrastructure',
    title: 'Infrastructure Project',
    category: 'Infrastructure',
    year: '20XX',
    location: 'Rwanda',
    client: 'Placeholder Client',
    area: 'X,XXX sqm',
    status: 'Completed',
    featured: false,
    shortDescription:
      'A major infrastructure project delivering lasting public value through precision engineering and expert construction management.',
    description:
      'Placeholder — replace with real project details when ready.',
    coverImage:    '/images/projects/placeholder-infrastructure/cover.jpg',
    featuredImage: '/images/projects/placeholder-infrastructure/featured.jpg',
    gallery: [
      '/images/projects/placeholder-infrastructure/gallery-1.jpg',
    ],
    services: ['Structural Engineering', 'Construction Management'],
    specs: {
      Location: 'Rwanda',
      Year:     '20XX',
      Category: 'Infrastructure',
      Client:   'Placeholder Client',
      Area:     'X,XXX sqm',
      Status:   'Completed',
    },
  },
]

// ── FILTER CATEGORIES ─────────────────────────────────────
export const projectCategories = [
  'All',
  'Commercial',
  'Residential',
  'Interior Design',
  'Infrastructure',
]

// ── PROJECTS PAGE CTA ─────────────────────────────────────
export const projectsCTA = {
  heading:     'Have a Project in Mind?',
  subline:     'From initial concept to final delivery — we bring your vision to life with precision and care.',
  primaryBtn:  { label: 'Start a Project', link: '/contact' },
  secondaryBtn: { label: 'Our Services',   link: '/services' },
}