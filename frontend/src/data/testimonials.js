/**
 * TESTIMONIALS DATA
 * ─────────────────────────────────────────────────────────────
 * Shared source of truth for the homepage teaser (HomeTestimonials)
 * and the full Testimonials page (TestimonialsHero + TestimonialsGrid).
 *
 * `avatar` is optional — leave empty to show an initials fallback
 * (auto-extracted from `name` by TestimonialCard).
 * ─────────────────────────────────────────────────────────────
 */

export const testimonials = [
  {
    id: 1,
    name: 'Jean-Pierre Habimana',
    role: 'CEO, Kigali Commercial Ventures',
    quote:
      'SAGEC delivered the Silverback Mall project on time and to a standard that exceeded our expectations. Their attention to structural detail and site management is unmatched in Rwanda.',
    avatar:
      'https://i.pinimg.com/736x/b4/6d/04/b46d04bc10a3b11b591953e57c9ebcd8.jpg',
  },
  {
    id: 2,
    name: 'Claudine Uwimana',
    role: 'Director of Infrastructure, Rwanda Governance Board',
    quote:
      'Working with SAGEC on the RGB headquarters was a seamless experience. They understood our institutional requirements and translated them into a building that truly represents our mandate.',
    avatar: '',
  },
  {
    id: 3,
    name: 'Patrick Nkurunziza',
    role: 'General Manager, Lemigo Hotel Kigali',
    quote:
      "The interior transformation of Lemigo Hotel was handled with exceptional professionalism. SAGEC's team respected our operational timeline and delivered a world-class finish.",
    avatar: '',
  },
  {
    id: 4,
    name: 'Amina Ndahiro',
    role: 'Director, Ndahiro Properties Ltd',
    quote:
      "SAGEC brought deep local knowledge and international engineering standards to our Florida House project. The result is a residence that stands out in Kigali's skyline.",
    avatar: '',
  },
  {
    id: 5,
    name: 'Emmanuel Bizimana',
    role: 'Head of Projects, Horizon Real Estate Rwanda',
    quote:
      'From planning through to handover, SAGEC maintained transparent communication and precise budgeting. I would not hesitate to engage them again for future developments.',
    avatar: '',
  },
  {
    id: 6,
    name: 'Sophie Murekatete',
    role: 'Managing Director, Kigali Urban Developers',
    quote:
      'Their multidisciplinary team handled architecture, structural engineering, and fit-out under one roof. The efficiency and quality of coordination saved us months on the project schedule.',
    avatar:
      'https://scontent.cdninstagram.com/v/t51.82787-19/518196272_18027622784704693_5655738059717363176_n.jpg?_nc_cat=103&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy41MzIuQzMifQ%3D%3D&_nc_ohc=AaApOUBNVMoQ7kNvwH2bR6q&_nc_oc=AdoOVHOa_WpG0tcIqkl7HBSPC_Q5_xy5-HyVYiLpFMPVpaBkJ7QOPH7jDEdcjXbS6V8&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=RpYQ8fGGuwtMDf-8q9oHlw&_nc_ss=7b6a8&oh=00_Af9PqhFWYjZ_4yE2aiavq0Uii2h3IpUb8xBUmBSVr9s3Qg&oe=6A239952',
  },
]

// ── TESTIMONIALS PAGE HERO COPY ─────────────────────────────
export const testimonialsHero = {
  eyebrow: 'Client Stories',
  headlineLines: ['What Our Clients', 'Say About Us'],
  subline:
    'Real feedback from partners, developers, and institutions who trust SAGEC to bring their vision to life.',
}
