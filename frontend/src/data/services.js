/**
 * SERVICES DATA
 * ─────────────────────────────────────────────────────────────
 * Used on: Homepage Services Overview + Full Services page
 *          + individual ServiceDetailPage (/services/:slug)
 *
 * image:       place files at /public/images/services/
 * detailImage: larger hero image for the detail page
 * deliverables: 4-5 bullet points per service (replace placeholders)
 * ─────────────────────────────────────────────────────────────
 */

export const services = [
  {
    id: 1,
    slug: 'architectural-design',
    title: 'Architectural Design',
    description:
      'Innovative, functional spaces that blend aesthetics with purpose — from initial concept through to detailed construction drawings ready for build.',
    image:       '/images/services/architectural-design.jpeg',
    detailImage: '/images/services/architectural-design-detail.jpeg',
    iconKey: 'architecture',
    link: '/services/architectural-design',
    deliverables: [
      'Concept design and feasibility studies',
      'Schematic and design development drawings',
      'Construction documentation packages',
      'Building permit and regulatory submissions',
      'Site visits and design supervision',
    ],
  },
  {
    id: 2,
    slug: 'structural-engineering',
    title: 'Structural Engineering',
    description:
      'Robust structural solutions engineered for safety, durability, and performance — every element calculated and verified to stand for generations.',
    image:       '/images/services/structural-engineering.jpeg',
    detailImage: '/images/services/structural-engineering-detail.jpeg',
    iconKey: 'structure',
    link: '/services/structural-engineering',
    deliverables: [
      'Structural analysis and design calculations',
      'Foundation and superstructure engineering',
      'Reinforced concrete and steel frame design',
      'Structural inspection and assessment reports',
      'Compliance with Rwanda building standards',
    ],
  },
  {
    id: 3,
    slug: 'mep-engineering',
    title: 'MEP Engineering',
    description:
      'Integrated mechanical, electrical, and plumbing systems designed for efficiency, sustainability, and long-term reliability across all building types.',
    image:       '/images/services/mep-engineering.jpeg',
    detailImage: '/images/services/mep-engineering-detail.jpeg',
    iconKey: 'mep',
    link: '/services/mep-engineering',
    deliverables: [
      'Mechanical HVAC system design',
      'Electrical load analysis and distribution design',
      'Plumbing and drainage system design',
      'Fire detection and suppression systems',
      'MEP coordination and clash detection',
    ],
  },
  {
    id: 4,
    slug: 'project-management',
    title: 'Project Management',
    description:
      'End-to-end project oversight — on time, within budget, and to the highest standards of quality and safety from groundbreaking to handover.',
    image:       '/images/services/project-management.jpeg',
    detailImage: '/images/services/project-management-detail.jpeg',
    iconKey: 'management',
    link: '/services/project-management',
    deliverables: [
      'Project planning, scheduling and budgeting',
      'Contractor procurement and management',
      'Risk identification and mitigation',
      'Quality assurance and control',
      'Progress reporting and client communication',
    ],
  },
  {
    id: 5,
    slug: 'construction-management',
    title: 'Construction Management',
    description:
      'Expert on-site coordination of contractors, timelines, and resources to deliver exceptional construction outcomes at every scale.',
    image:       '/images/services/construction-management.jpeg',
    detailImage: '/images/services/construction-management-detail.jpeg',
    iconKey: 'construction',
    link: '/services/construction-management',
    deliverables: [
      'On-site construction supervision',
      'Subcontractor coordination and oversight',
      'Health, safety and compliance management',
      'Materials procurement and logistics',
      'Defects management and snagging',
    ],
  },
  {
    id: 6,
    slug: 'interior-design',
    title: 'Interior Design',
    description:
      'Transforming interiors into experiences — curating spaces that reflect identity, comfort, and timeless elegance for residential, commercial, and hospitality projects.',
    image:       '/images/services/interior-design.jpeg',
    detailImage: '/images/services/interior-design-detail.jpeg',
    iconKey: 'interior',
    link: '/services/interior-design',
    deliverables: [
      'Interior concept and mood board development',
      'Space planning and furniture layout',
      'Material, finish and fixture specification',
      'Lighting design and coordination',
      'On-site installation supervision',
    ],
  },
]

// ── PROCESS STEPS ─────────────────────────────────────────
// Replace with SAGEC's real process steps when ready

export const processSteps = [
  {
    id: 1,
    number: '01',
    title: 'Brief & Consultation',
    description:
      'We begin by listening — understanding your vision, goals, budget, and timeline to lay the right foundation.',
  },
  {
    id: 2,
    number: '02',
    title: 'Concept Design',
    description:
      'Our architects and engineers translate your brief into initial concepts, sketches, and feasibility studies.',
  },
  {
    id: 3,
    number: '03',
    title: 'Technical Engineering',
    description:
      'Detailed structural, MEP, and construction drawings are developed and submitted for regulatory approvals.',
  },
  {
    id: 4,
    number: '04',
    title: 'Construction',
    description:
      'Our team manages every aspect of the build — coordinating contractors, quality, safety, and timelines on site.',
  },
  {
    id: 5,
    number: '05',
    title: 'Handover & Completion',
    description:
      'We conduct a thorough inspection, resolve all snagging items, and hand over a completed project you are proud of.',
  },
]

// ── SERVICES PAGE CTA ─────────────────────────────────────
export const servicesCTA = {
  heading:  'Ready to Start Your Project?',
  subline:  'Tell us about your vision and our team will get back to you within 24 hours.',
  primaryBtn:   { label: 'Get a Quote',        link: '/contact' },
  secondaryBtn: { label: 'View Our Projects',  link: '/projects' },
}