// src/sections/home/FeaturedProjects/index.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "@hooks/useInView";
import { useProjects, projectQuery } from "@hooks/useProjects";
import { useHomePage } from "@hooks/useHomePage";
import { usePrefetch } from "@hooks/usePrefetch";
import { mediaURL, mediaThumbURL } from "@lib/api";
import styles from "./FeaturedProjects.module.css";

// ─── Animation variants ────────────────────────────────────────
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const headerVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// ─── Per-card photo slider ─────────────────────────────────────
// FIX #1: Use a ref for the interval so it doesn't restart on every
// render. The current index is tracked via a ref too so the interval
// callback always reads the latest value without needing it in deps.
function PhotoSlider({ images, initialDelay = 0 }) {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const timerRef = useRef(null);
  const delayRef = useRef(null);
  const count = images.length;

  // PERF FIX: previously every image in `images` got a backgroundImage
  // set immediately on mount, so the browser fetched a project's whole
  // gallery the instant the card rendered — across every card on the
  // homepage at once. Now only the slides actually shown so far get a
  // real backgroundImage; the rest stay blank until the slider reaches
  // them, spreading the requests out instead of firing them all at once.
  const [seen, setSeen] = useState(() => new Set([0]));

  // Keep ref in sync with state so interval always has fresh value
  useEffect(() => {
    currentRef.current = current;
    setSeen((prev) => (prev.has(current) ? prev : new Set(prev).add(current)));
  }, [current]);

  useEffect(() => {
    if (count <= 1) return;

    delayRef.current = setTimeout(() => {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % count);
      }, 3000);
    }, initialDelay);

    return () => {
      clearTimeout(delayRef.current);
      clearInterval(timerRef.current);
    };
  }, [count, initialDelay]);

  const handleDotClick = (e, i) => {
    e.preventDefault();
    e.stopPropagation();
    // Reset the interval so clicking a dot doesn't cause an immediate jump
    clearTimeout(delayRef.current);
    clearInterval(timerRef.current);
    setCurrent(i);
    if (count > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % count);
      }, 5000);
    }
  };

  return (
    <div className={styles.sliderWrapper}>
      <div
        className={styles.sliderTrack}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className={styles.slide}
            style={src && seen.has(i) ? { backgroundImage: `url(${src})` } : undefined}
            role="img"
            aria-label={`Project image ${i + 1}`}
            aria-hidden={i !== current}
          />
        ))}
      </div>

      {/* Dots — only rendered when there is more than one image */}
      {count > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Project images">
          {images.map((_, i) => (
            <button
              key={i}
              role="tab"
              type="button"
              aria-selected={i === current}
              aria-label={`Go to image ${i + 1}`}
              className={`${styles.dot} ${i === current ? styles.activeDot : ""}`}
              onClick={(e) => handleDotClick(e, i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Individual project card ───────────────────────────────────
function ProjectCard({ project, isHero = false, index = 0 }) {
  const prefetch = usePrefetch()
  const prefetchThis = () => prefetch(projectQuery(project.slug))

  // CMS shape has `gallery` (array of media docs) + `coverImage`, not a
  // flat `images` array like the old static data — normalize here so
  // PhotoSlider below doesn't need to know about either shape.
  // PERF FIX: cap to 4 images max — a homepage teaser card never needs a
  // project's entire gallery (some have far more), and each extra slide
  // is another full image download. The full gallery still shows on the
  // project detail page, which reads `gallery` directly, not this cap.
  const sliderImages = project.gallery?.length
    ? project.gallery.slice(0, 4).map((g) => mediaThumbURL(g.image))
    : [mediaThumbURL(project.coverImage)]

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      // FIX #3: text-decoration reset lives in CSS but motion.div
      // wrapping means the Link's default styles could leak — handled
      // via .card in CSS (text-decoration: none added there).
    >
      <Link
        to={`/projects/${project.slug}`}
        onMouseEnter={prefetchThis}
        onFocus={prefetchThis}
        // FIX #2: Removed inline width from the wrapper div below.
        // Hero vs small card sizing is now handled purely in CSS via
        // .heroCard modifier class. No inline styles override CSS rules.
        className={`${styles.card} ${isHero ? styles.heroCard : ""}`}
        aria-label={`View project: ${project.title}`}
      >
        {/* ── Image area: slider + badge overlays ── */}
        {/* FIX #2: no inline width here — CSS handles hero vs small */}
        <div className={styles.imageArea}>
          <PhotoSlider images={sliderImages} initialDelay={index * 500} />
          <span className={styles.categoryBadge}>{project.category}</span>
          <span className={styles.yearBadge}>{project.year}</span>
        </div>

        {/* ── Card body ── */}
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{project.title}</h3>

          <div className={styles.cardMeta}>
            <svg
              className={styles.metaIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className={styles.cardLocation}>{project.location}</span>
          </div>

          <p className={styles.cardDescription}>{project.shortDescription}</p>

          {/* FIX #4: removed unused metaDot span */}
          <span className={styles.cardCta}>
            View Project
            <span className={styles.ctaArrow} aria-hidden="true">
              <svg
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6h8M6 2l4 4-4 4" />
              </svg>
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Background SVG construction sketches ─────────────────────
function BackgroundSketches() {
  return (
    <svg
      className={styles.bgSketches}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      <defs>
        {/* Radial gradient for mask: white at edges fades to black at center */}
        <radialGradient id="mask-fade-gradient" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="black" />
          <stop offset="100%" stopColor="white" />
        </radialGradient>
        {/* Mask: white at corners fades to black toward center */}
        <mask id="sketch-fade-mask">
          <rect width="1440" height="900" fill="url(#mask-fade-gradient)" />
        </mask>
      </defs>

      {/* Wrap all sketches in mask to fade them toward center */}
      <g mask="url(#sketch-fade-mask)">

      {/* ══ TOP-LEFT: Tower crane (white base lines) ══ */}
      <g opacity="0.20" stroke="#FFFFFF" strokeWidth="1" fill="none">
        {/* Mast — double line for structural feel */}
        <line x1="80" y1="20" x2="80" y2="270" />
        <line x1="92" y1="20" x2="92" y2="270" />
        {/* Main jib (right arm) */}
        <line x1="80" y1="58" x2="280" y2="58" />
        {/* Counter jib (left arm) */}
        <line x1="30" y1="58" x2="80" y2="58" />
        {/* Counter weight block */}
        <rect x="12" y="52" width="22" height="16" rx="1" />
        {/* Diagonal stays from apex */}
        <line x1="86" y1="28" x2="280" y2="58" />
        <line x1="86" y1="28" x2="30" y2="58" />
        {/* Trolley on jib */}
        <rect x="175" y="54" width="14" height="10" rx="1" />
        {/* Hoist cable + hook block */}
        <line x1="182" y1="64" x2="182" y2="118" />
        <rect x="173" y="118" width="18" height="12" rx="1" />
        {/* Mast cross-braces */}
        <line x1="80" y1="100" x2="92" y2="124" />
        <line x1="92" y1="100" x2="80" y2="124" />
        <line x1="80" y1="148" x2="92" y2="172" />
        <line x1="92" y1="148" x2="80" y2="172" />
        <line x1="80" y1="196" x2="92" y2="220" />
        <line x1="92" y1="196" x2="80" y2="220" />
        {/* Base frame */}
        <rect x="56" y="268" width="60" height="12" rx="1" />
        <line x1="48" y1="280" x2="160" y2="280" />
      </g>
      {/* Orange accent — hook + cable highlight */}
      <g opacity="0.28" stroke="#F26522" strokeWidth="1.5" fill="none">
        <rect x="173" y="118" width="18" height="12" rx="1" />
        <path d="M179 130 Q179 144 186 144 Q193 144 193 137 Q193 130 186 130" />
        <line x1="182" y1="90" x2="182" y2="118" />
      </g>

      {/* ══ TOP-RIGHT: T-square + compass rose ══ */}
      <g
        opacity="0.20"
        stroke="#FFFFFF"
        strokeWidth="1"
        fill="none"
        transform="translate(1175, 8)"
      >
        {/* T-square head */}
        <rect x="36" y="0" width="120" height="22" rx="2" />
        {/* T-square blade */}
        <rect x="88" y="0" width="14" height="210" rx="2" />
        {/* Major ticks on blade */}
        <line x1="102" y1="40" x2="110" y2="40" />
        <line x1="102" y1="60" x2="112" y2="60" />
        <line x1="102" y1="80" x2="110" y2="80" />
        <line x1="102" y1="100" x2="112" y2="100" />
        <line x1="102" y1="120" x2="110" y2="120" />
        <line x1="102" y1="140" x2="112" y2="140" />
        <line x1="102" y1="160" x2="110" y2="160" />
        <line x1="102" y1="180" x2="112" y2="180" />
        {/* Minor ticks on head */}
        <line x1="56"  y1="16" x2="56"  y2="22" />
        <line x1="76"  y1="16" x2="76"  y2="22" />
        <line x1="116" y1="16" x2="116" y2="22" />
        <line x1="136" y1="16" x2="136" y2="22" />
      </g>
      {/* Orange compass rose — top right corner */}
      <g
        opacity="0.28"
        stroke="#F26522"
        strokeWidth="1.2"
        fill="none"
        transform="translate(1308, 48)"
      >
        <circle cx="52" cy="52" r="38" />
        <circle cx="52" cy="52" r="5" />
        {/* N needle (filled) */}
        <line x1="52" y1="14" x2="52" y2="47" />
        <polygon points="52,10 47,24 57,24" fill="#F26522" opacity="0.45" />
        {/* S needle */}
        <line x1="52" y1="57" x2="52" y2="88" />
        <polygon points="52,92 47,78 57,78" fill="none" />
        {/* E / W arms */}
        <line x1="14" y1="52" x2="47" y2="52" />
        <line x1="57" y1="52" x2="90" y2="52" />
        {/* Cardinal tick marks */}
        <line x1="52" y1="6"  x2="52" y2="10"  strokeWidth="2" />
        <line x1="52" y1="94" x2="52" y2="98"  strokeWidth="2" />
        <line x1="8"  y1="52" x2="12" y2="52"  strokeWidth="2" />
        <line x1="92" y1="52" x2="96" y2="52"  strokeWidth="2" />
      </g>

      {/* ══ BOTTOM-LEFT: Hard hat + scaffolding ══ */}
      <g
        opacity="0.20"
        stroke="#FFFFFF"
        strokeWidth="1"
        fill="none"
        transform="translate(0, 670)"
      >
        {/* Hard hat dome */}
        <path d="M28 86 Q28 38 82 36 Q136 34 136 86 Z" />
        {/* Brim */}
        <line x1="16"  y1="86" x2="148" y2="86" />
        <line x1="18"  y1="93" x2="146" y2="93" />
        <path d="M20 86 Q20 94 28 94" />
        <path d="M144 86 Q144 94 136 94" />
        {/* Vent ridge */}
        <line x1="82" y1="36" x2="82" y2="44" />
        <line x1="60" y1="39" x2="62" y2="47" />
        <line x1="104" y1="39" x2="102" y2="47" />
      </g>
      {/* Orange scaffolding — bottom left */}
      <g
        opacity="0.26"
        stroke="#F26522"
        strokeWidth="1.2"
        fill="none"
        transform="translate(148, 715)"
      >
        {/* Vertical standards */}
        <line x1="0"   y1="0" x2="0"   y2="185" />
        <line x1="65"  y1="0" x2="65"  y2="185" />
        <line x1="130" y1="0" x2="130" y2="185" />
        {/* Horizontal ledgers */}
        <line x1="0" y1="0"   x2="130" y2="0"   />
        <line x1="0" y1="62"  x2="130" y2="62"  />
        <line x1="0" y1="124" x2="130" y2="124" />
        <line x1="0" y1="185" x2="130" y2="185" />
        {/* Diagonal braces */}
        <line x1="0"  y1="0"   x2="65"  y2="62"  />
        <line x1="65" y1="0"   x2="0"   y2="62"  />
        <line x1="65" y1="62"  x2="130" y2="124" />
        <line x1="130" y1="62" x2="65"  y2="124" />
      </g>

      {/* ══ BOTTOM-RIGHT: Architectural ruler + blueprint grid ══ */}
      <g
        opacity="0.20"
        stroke="#FFFFFF"
        strokeWidth="1"
        fill="none"
        transform="translate(1095, 752)"
      >
        {/* Blueprint grid (above ruler) */}
        <line x1="0"   y1="-22" x2="325" y2="-22" />
        <line x1="0"   y1="-52" x2="325" y2="-52" />
        <line x1="0"   y1="-82" x2="325" y2="-82" />
        <line x1="42"  y1="-82" x2="42"  y2="-22" />
        <line x1="125" y1="-82" x2="125" y2="-22" />
        <line x1="208" y1="-82" x2="208" y2="-22" />
        <line x1="283" y1="-82" x2="283" y2="-22" />
        {/* Ruler body */}
        <rect x="0" y="0" width="325" height="32" rx="2" />
        {/* Major ticks */}
        <line x1="0"   y1="0" x2="0"   y2="15" />
        <line x1="42"  y1="0" x2="42"  y2="15" />
        <line x1="83"  y1="0" x2="83"  y2="15" />
        <line x1="125" y1="0" x2="125" y2="15" />
        <line x1="166" y1="0" x2="166" y2="15" />
        <line x1="208" y1="0" x2="208" y2="15" />
        <line x1="249" y1="0" x2="249" y2="15" />
        <line x1="283" y1="0" x2="283" y2="15" />
        <line x1="325" y1="0" x2="325" y2="15" />
        {/* Minor ticks */}
        <line x1="21"  y1="0" x2="21"  y2="9" />
        <line x1="62"  y1="0" x2="62"  y2="9" />
        <line x1="104" y1="0" x2="104" y2="9" />
        <line x1="145" y1="0" x2="145" y2="9" />
        <line x1="187" y1="0" x2="187" y2="9" />
        <line x1="228" y1="0" x2="228" y2="9" />
        <line x1="262" y1="0" x2="262" y2="9" />
        <line x1="304" y1="0" x2="304" y2="9" />
      </g>
      {/* Orange dimension arrows — bottom right */}
      <g
        opacity="0.28"
        stroke="#F26522"
        strokeWidth="1.3"
        fill="none"
        transform="translate(1198, 836)"
      >
        <line x1="0" y1="10" x2="185" y2="10" />
        <polygon points="0,10 12,5 12,15"   fill="#F26522" opacity="0.55" />
        <polygon points="185,10 173,5 173,15" fill="#F26522" opacity="0.55" />
        {/* Centre datum line */}
        <line x1="92" y1="0" x2="92" y2="22" strokeDasharray="4,3" />
      </g>

      </g>
    </svg>
  );
}

// ─── Main section ──────────────────────────────────────────────
export default function FeaturedProjects() {
  const { data: projects, isLoading, isError } = useProjects();
  const { data: teaser } = useHomePage((home) => home.projectsTeaser);

  // FIX #7: useInView returns [ref, inView] — ref goes on the DOM node
  // via the motion.section's ref prop, which Framer Motion forwards fine.
  const [sectionRef, inView] = useInView({ threshold: 0.08 });

  if (isLoading || isError || !projects?.length) return null;

  const hero = projects.find((p) => p.featured) ?? projects[0];
  // PERF FIX: this used to render EVERY project in the collection on the
  // homepage (hero + literally all the rest) — a "Featured Projects"
  // teaser rendering the entire catalogue, each with its own image
  // slider. Capped to 5 extra cards (6 total with the hero), which is
  // what a homepage teaser section is for; the full list lives on /projects.
  const rest = projects.filter((p) => p.id !== hero.id).slice(0, 5);

  return (
    <motion.section
      ref={sectionRef}
      className={styles.section}
      variants={sectionVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      aria-labelledby="fp-heading"
    >
      <BackgroundSketches />

      <div className={styles.container}>

        {/* Header */}
        <motion.div
          className={styles.header}
          variants={headerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <span className={styles.eyebrow}>{teaser?.eyebrow ?? 'Our Work'}</span>
          <h2 className={styles.heading} id="fp-heading">
            {teaser?.headingStart ?? 'Featured'} <span>{teaser?.headingHighlight ?? 'Projects'}</span>
          </h2>
          <p className={styles.subtext}>
            {teaser?.subtext ?? 'From landmark commercial developments to refined interiors — built with precision across Rwanda.'}
          </p>
        </motion.div>

        {/* Cards */}
        <div className={styles.grid}>

          {/* Hero card — full width */}
          <div className={styles.heroWrapper}>
            <ProjectCard project={hero} isHero index={0} />
          </div>

          {/* Remaining 5 cards — 3-column grid */}
          <div className={styles.smallGrid}>
            {rest.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i + 1}
              />
            ))}
          </div>

        </div>

        {/* Footer CTA */}
        <div className={styles.footer}>
          <Link to={teaser?.viewAllLink ?? '/projects'} className={styles.viewAllBtn}>
            {teaser?.viewAllLabel ?? 'View All Projects'}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 8h10M8 3l5 5-5 5" />
            </svg>
          </Link>
        </div>

      </div>
    </motion.section>
  );
}