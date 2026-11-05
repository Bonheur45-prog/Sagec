/**
 * HERO SLIDES DATA
 * ─────────────────────────────────────────────────────────────
 * Each slide supports:
 *   type:      'video' | 'image'
 *   src:       path to the asset (place files in /public/...)
 *   poster:    video only — shown while video loads
 *   headline:  large typewriter-animated title
 *   subline:   supporting text beneath the headline
 *   duration:  ms to show slide — set null for video (uses onEnded)
 *
 * To reorder slides: change the array order.
 * To change a video to image: change type + src.
 * To add a slide: add a new object with a unique id.
 * ─────────────────────────────────────────────────────────────
 */

export const heroSlides = [
  {
    id: 1,
    type: 'video',
    src: '/videos/hero-construction.mp4',
    poster: '/images/hero/slide-1-poster.jpg',
    headline: 'Building Excellence',
    subline: 'Your Vision, Our Expertise — Delivering innovative architecture and construction across Rwanda.',
    duration: null, // null = play full video, then advance
  },
  {
    id: 2,
    type: 'image',
    src: '/images/hero/silverback-mall.jpg',
    headline: 'Landmark Commercial Projects',
    subline: 'Iconic structures that define Kigali\'s skyline — built with precision and purpose.',
    duration: 7000,
  },
  {
    id: 3,
    type: 'image',
    src: '/images/hero/florida-house.jpg',
    headline: 'Precision Engineering',
    subline: 'Where structural excellence meets architectural beauty — every detail engineered to last.',
    duration: 7000,
  },
  {
    id: 4,
    type: 'image',
    src: '/images/hero/lemigo-interior.jpeg',
    headline: 'Interior Design Excellence',
    subline: 'Transforming spaces into unforgettable experiences — where style meets function.',
    duration: 7000,
  },
  {
    id: 5,
    type: 'image',
    src: '/images/hero/rgb-building.jpeg',
    headline: 'Shaping Rwanda\'s Future',
    subline: 'Delivering innovative, sustainable construction solutions — building tomorrow, today.',
    duration: 7000,
  },
]

export const heroStats = [
  { value: '10+', label: 'Years Experience' },
  { value: '30+', label: 'Projects Completed' },
  { value: '50+', label: 'Happy Clients' },
  { value: 'Kigali', label: 'Rwanda' },
]
