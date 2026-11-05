/**
 * BLOG DATA
 * ─────────────────────────────────────────────────────────────
 * Shared source of truth for BlogPage (grid), BlogPostPage (detail),
 * and the sidebar (popular posts, tags) on both.
 *
 * `content` is modeled as an array of typed blocks (paragraph, image,
 * checklist, quote, heading, gallery) rather than one long HTML string —
 * this maps directly onto a future CMS "blocks" field instead of
 * needing a rewrite when the backend arrives.
 *
 * `comments` is an array per post (not just a count) so it maps
 * directly onto a CMS "comments" relation later. Display counts are
 * derived from comments.length wherever needed, never hardcoded.
 *
 * images: place files at /public/images/blog/
 * ─────────────────────────────────────────────────────────────
 */

export const blogAuthors = [
  {
    id: 1,
    name: 'SAGEC Team',
    avatar: '/images/blog/authors/team.jpg',
    role: 'Company Blog',
    bio: 'Insights from the architects, engineers, and project managers behind SAGEC Ltd.',
    socials: [
      { iconKey: 'facebook', href: '#' },
      { iconKey: 'instagram', href: '#' },
      { iconKey: 'x', href: '#' },
      { iconKey: 'linkedin', href: '#' },
    ],
  },
  {
    id: 2,
    name: 'Yvette Mukamana',
    avatar: '/images/blog/authors/yvette-mukamana.jpg',
    role: 'Marketing & Communications Lead',
    bio: 'Covering project updates, design trends, and news from across the built environment sector in Rwanda.',
    socials: [
      { iconKey: 'facebook', href: '#' },
      { iconKey: 'instagram', href: '#' },
      { iconKey: 'x', href: '#' },
      { iconKey: 'linkedin', href: '#' },
    ],
  },
]

export const blogCategories = [
  'All',
  'Architecture',
  'Engineering',
  'Interior Design',
  'Projects',
  'News',
]

export const blogTags = [
  'Architecture',
  'Engineering',
  'Interior Design',
  'Projects',
  'News',
  'Sustainability',
  'Project Updates',
  'Industry Insights',
]

export const blogPosts = [
  {
    id: 1,
    slug: 'silverback-mall-design-process',
    title: 'Inside the Design Process: Silverback Mall',
    excerpt:
      "How SAGEC approached the architectural and structural challenges of delivering Kigali's most ambitious retail development — from concept sketch to opening day.",
    category: 'Projects',
    tags: ['Projects', 'Engineering'],
    authorId: 1,
    publishedAt: '2024-03-12',
    coverImage:
      'https://images.squarespace-cdn.com/content/v1/687a4ad3366a2678166725fa/27279f5e-8b1a-4739-adf4-e35b4dd79037/DSC07363.jpg?format=2500w',
    content: [
      {
        type: 'paragraph',
        text: "The Silverback Mall project stands as one of SAGEC's most complex and rewarding commissions. From the earliest concept meetings with the client through to the final handover, the project demanded innovation at every stage.",
      },
      {
        type: 'paragraph',
        text: "Our architectural team began with a deep study of Kigali's commercial landscape — understanding not just what the city needed today, but what it would need a decade from now. The result is a structure designed for adaptability as much as for immediate function.",
      },
      {
        type: 'paragraph',
        text: 'Structurally, the site presented significant challenges. The hillside terrain required a bespoke foundation solution that our engineering team developed over several months of geotechnical analysis. The final design distributes load across a hybrid concrete and steel frame that responds intelligently to the ground conditions below.',
      },
    ],
    comments: [
      {
        id: 1,
        name: 'Eric Nshimiyimana',
        avatar: null,
        date: '2024-03-14',
        text: "Watched this go up from the road every week — incredible how fast the frame came together once the foundation work was done.",
      },
      {
        id: 2,
        name: 'Grace Umutoni',
        avatar: null,
        date: '2024-03-16',
        text: 'Would love a follow-up post on how the hillside foundation solution was engineered.',
      },
    ],
  },
  {
    id: 2,
    slug: 'sustainable-construction-rwanda',
    title: 'Building Green: Sustainable Construction in Rwanda',
    excerpt:
      "Rwanda's construction sector is at a turning point. SAGEC explores how sustainable building practices are being integrated into local projects without compromising cost or timeline.",
    category: 'Engineering',
    tags: ['Sustainability', 'Engineering'],
    authorId: 2,
    publishedAt: '2024-02-28',
    coverImage: '/images/blog/sustainable-construction-rwanda/cover.jpg',
    content: [
      {
        type: 'paragraph',
        text: 'Sustainability in construction is no longer a luxury — it is a responsibility. At SAGEC, we have been integrating green building principles into our projects for several years, and the results speak for themselves.',
      },
      {
        type: 'paragraph',
        text: 'From passive cooling strategies that reduce mechanical HVAC loads to rainwater harvesting systems embedded in our commercial developments, the toolkit of sustainable construction is broader and more accessible than many clients realise.',
      },
    ],
    comments: [
      {
        id: 1,
        name: 'David Habyarimana',
        avatar: null,
        date: '2024-03-01',
        text: 'Would be great to see a case study of one of these projects with the actual energy savings.',
      },
    ],
  },
  {
    id: 3,
    slug: 'lemigo-hotel-interior-transformation',
    title: 'The Art of Hospitality: Lemigo Hotel Interior',
    excerpt:
      "A look at how SAGEC's interior design team transformed Lemigo Hotel into one of Kigali's premier hospitality destinations — balancing luxury, function, and Rwandan identity.",
    category: 'Interior Design',
    tags: ['Interior Design', 'Projects'],
    authorId: 2,
    publishedAt: '2024-02-10',
    coverImage: '/images/blog/lemigo-hotel-interior/cover.jpg',
    content: [
      {
        type: 'paragraph',
        text: "Interior design for a five-star hotel demands a rare combination of skills — aesthetic vision, technical precision, and an understanding of how guests move through and experience space. The Lemigo Hotel commission gave SAGEC's interior team the opportunity to demonstrate all three.",
      },
      {
        type: 'paragraph',
        text: 'The brief was clear: create interiors that feel unmistakably Rwandan without resorting to pastiche. Every material selection, every lighting decision, and every furniture specification was made with this principle in mind.',
      },
    ],
    comments: [],
  },
  {
    id: 4,
    slug: 'kigali-master-plan-opportunities',
    title: 'Kigali 2050: What the Master Plan Means for Construction',
    excerpt:
      "Kigali's updated master plan signals a major shift in urban development priorities. We break down what it means for architects, developers, and engineering firms operating in Rwanda.",
    category: 'News',
    tags: ['News', 'Industry Insights'],
    authorId: 1,
    publishedAt: '2024-01-22',
    coverImage: '/images/blog/kigali-master-plan/cover.jpg',
    content: [
      {
        type: 'paragraph',
        text: "The release of Kigali's updated master plan has been one of the most significant events in Rwanda's built environment sector in recent years. For firms like SAGEC, understanding its implications is not optional — it is essential to responsible practice.",
      },
      {
        type: 'paragraph',
        text: 'The plan prioritises transit-oriented development, mixed-use zoning, and a significant increase in green space requirements. Each of these has direct consequences for how buildings are designed, where they are located, and what approvals they require.',
      },
    ],
    comments: [
      {
        id: 1,
        name: 'Aline Mukeshimana',
        avatar: null,
        date: '2024-01-24',
        text: 'Curious how the green space requirements will affect commercial plot ratios going forward.',
      },
      {
        id: 2,
        name: 'Eric Nshimiyimana',
        avatar: null,
        date: '2024-01-25',
        text: 'Good breakdown — transit-oriented development is long overdue for Kigali.',
      },
    ],
  },
  {
    id: 5,
    slug: 'structural-engineering-high-rise',
    title: 'Engineering Tall: Structural Considerations for High-Rise in Kigali',
    excerpt:
      "As Kigali's skyline grows taller, so do the structural engineering challenges. SAGEC's lead engineers share the principles behind safe and efficient high-rise design in East Africa.",
    category: 'Engineering',
    tags: ['Engineering', 'Projects'],
    authorId: 2,
    publishedAt: '2024-01-08',
    coverImage: '/images/blog/structural-engineering-high-rise/cover.jpg',
    content: [
      {
        type: 'paragraph',
        text: "High-rise construction in Kigali presents a unique set of structural challenges that differ meaningfully from those encountered in more temperate climates. Wind loads, seismic considerations, and the particular characteristics of Kigali's volcanic soil all factor into our structural calculations.",
      },
      {
        type: 'paragraph',
        text: 'Our engineering team has developed a set of principles for tall building design in the East African context, drawing on international best practice while remaining grounded in local conditions.',
      },
    ],
    comments: [],
  },
  {
    id: 6,
    slug: 'rgb-building-civic-architecture',
    title: 'Civic Architecture: Designing for Public Trust',
    excerpt:
      'The RGB headquarters project gave SAGEC a rare opportunity to explore what civic architecture means in modern Rwanda — buildings that project institutional authority while remaining accessible to citizens.',
    category: 'Architecture',
    tags: ['Architecture', 'Projects'],
    authorId: 1,
    publishedAt: '2023-12-15',
    coverImage: '/images/blog/rgb-building-civic-architecture/cover.jpg',
    content: [
      {
        type: 'paragraph',
        text: 'Civic buildings carry a weight that commercial or residential projects do not. They represent the state, the institution, the public interest. Getting them right demands a sensitivity to context that goes beyond the purely aesthetic.',
      },
      {
        type: 'paragraph',
        text: 'The RGB headquarters commission asked us to design a building that would stand for decades as a symbol of good governance — transparent, approachable, and authoritative in equal measure.',
      },
    ],
    comments: [
      {
        id: 1,
        name: 'Grace Umutoni',
        avatar: null,
        date: '2023-12-17',
        text: "The transparency angle really comes through in the facade design — well done to the team.",
      },
    ],
  },
  {
    id: 7,
    slug: 'women-in-construction-rwanda',
    title: "Women in Construction: SAGEC's Commitment to Diversity",
    excerpt:
      'Rwanda leads Africa in gender equality metrics. SAGEC reflects on its own progress in building a more diverse and inclusive workforce across architecture, engineering, and site management.',
    category: 'News',
    tags: ['News', 'Industry Insights'],
    authorId: 2,
    publishedAt: '2023-12-03',
    coverImage: '/images/blog/women-in-construction-rwanda/cover.jpg',
    content: [
      {
        type: 'paragraph',
        text: "Rwanda's record on gender equality is well documented. The country consistently ranks among the world's leaders on political representation and economic participation. The construction sector, however, has historically lagged behind.",
      },
      {
        type: 'paragraph',
        text: 'At SAGEC, we have made a conscious commitment to changing this — not through tokenism, but through structural changes to how we recruit, develop, and promote talent.',
      },
    ],
    comments: [
      {
        id: 1,
        name: 'Aline Mukeshimana',
        avatar: null,
        date: '2023-12-05',
        text: 'Would love to see more on the mentorship programs mentioned in your last careers post.',
      },
    ],
  },
  {
    id: 8,
    slug: 'biophilic-design-office-spaces',
    title: 'Biophilic Design: Bringing Nature Into the Workspace',
    excerpt:
      "The evidence is clear — workplaces that incorporate natural elements improve wellbeing and productivity. SAGEC explores how biophilic design principles are being applied in Kigali's office developments.",
    category: 'Architecture',
    tags: ['Architecture', 'Sustainability'],
    authorId: 1,
    publishedAt: '2023-11-18',
    coverImage: '/images/blog/biophilic-design-office-spaces/cover.jpg',
    content: [
      {
        type: 'paragraph',
        text: 'Biophilic design — the integration of natural elements, materials, and patterns into the built environment — has moved from niche theory to mainstream practice over the past decade. The research supporting its benefits is compelling.',
      },
      {
        type: 'paragraph',
        text: "In Kigali's warm climate, biophilic design takes on a particular richness. The abundance of natural light, the lush vegetation that characterises the city's hillsides, and the cultural connection to the land all create opportunities that designers in colder climates can only dream of.",
      },
    ],
    comments: [],
  },
  {
    id: 9,
    slug: 'project-management-construction-rwanda',
    title: 'Delivering On Time: Project Management in Rwandan Construction',
    excerpt:
      "Timeline adherence is one of the biggest challenges in African construction. SAGEC's project management team shares the systems and culture that help us consistently deliver on schedule.",
    category: 'Engineering',
    tags: ['Project Updates', 'Engineering'],
    authorId: 2,
    publishedAt: '2023-11-05',
    coverImage: '/images/blog/project-management-construction-rwanda/cover.jpg',
    content: [
      {
        type: 'paragraph',
        text: 'Construction delays are a near-universal challenge — but they are not inevitable. At SAGEC, our track record of on-time delivery is not accidental. It is the result of deliberate systems, clear accountability, and a culture that treats a deadline as a commitment rather than a suggestion.',
      },
      {
        type: 'paragraph',
        text: 'Our project management methodology draws on international frameworks while adapting to the realities of the Rwandan construction market — including supply chain dynamics, regulatory timelines, and workforce considerations that are specific to this context.',
      },
    ],
    comments: [
      {
        id: 1,
        name: 'David Habyarimana',
        avatar: null,
        date: '2023-11-07',
        text: 'Solid read — the point about treating deadlines as commitments rather than suggestions should be printed on every site office wall.',
      },
    ],
  },
]
