'use client';

// src/sections/home/WhyChooseUs/index.jsx
import { useRef } from "react";
import { Link } from '@site/router';
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "@hooks/useInView";
import { useHomePage } from "@hooks/useHomePage";
import { mediaURL } from "@lib/api";
import styles from "./WhyChooseUs.module.css";

// ─── Animation variants ────────────────────────────────────────
const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const reasonVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.12,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// ─── Single reason row with circle-draw animation ──────────────
function ReasonItem({ reason, index, sectionInView }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const animated = sectionInView && inView;

  return (
    <motion.div
      ref={ref}
      className={`${styles.reason} ${animated ? styles.animated : ""}`}
      custom={index}
      variants={reasonVariants}
      initial="hidden"
      animate={sectionInView ? "visible" : "hidden"}
    >
      <div className={styles.iconWrap} aria-hidden="true">
        <svg
          className={styles.iconCircle}
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className={styles.circlePath} cx="16" cy="16" r="14" />
          <polyline className={styles.checkPath} points="10,16 14,20 22,12" />
        </svg>
      </div>

      <div className={styles.reasonText}>
        <h3 className={styles.reasonTitle}>{reason.title}</h3>
        <p className={styles.reasonDesc}>{reason.description}</p>
      </div>
    </motion.div>
  );
}

// ─── Right column media card ───────────────────────────────────
function MediaCard({ media }) {
  const src = media?.type === 'video' ? mediaURL(media.video?.url) : mediaURL(media?.image?.url)
  const hasSource = !!src;

  return (
    <div className={styles.mediaCol}>
      <div className={styles.mediaCard}>
        {!hasSource ? (
          <div className={styles.placeholder}>
            <svg
              className={styles.placeholderIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {media?.type === "video" ? (
                <>
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </>
              )}
            </svg>
          </div>
        ) : media.type === "video" ? (
          <video
            className={styles.mediaVideo}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            aria-label="SAGEC project showcase"
          />
        ) : (
          <img
            className={styles.mediaAsset}
            src={src}
            alt={media.alt || ''}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    </div>
  );
}

// ─── Main section ──────────────────────────────────────────────
export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const [inViewRef, inView] = useInView({ threshold: 0.08 });
  const { data, isLoading, isError } = useHomePage((home) => home.whyChooseUs);

  // Parallax: background moves dramatically via Framer Motion scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-25%', '25%']);

  const setRefs = (el) => {
    sectionRef.current = el;
    inViewRef.current = el;
  };

  if (isLoading || isError || !data) return null;

  const reasons = data.reasons ?? [];
  const backgroundUrl = mediaURL(data.backgroundImage?.url);

  return (
    <section
      ref={setRefs}
      className={styles.section}
      aria-labelledby="wcu-heading"
    >
      <div className={styles.parallaxClip} aria-hidden="true">
        <motion.div
          className={styles.parallaxBg}
          style={{
            y: backgroundY,
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
          }}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.inner}>

        {/* ── LEFT: content ── */}
        <div className={styles.content}>

          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <span className={styles.eyebrow}>{data.eyebrow}</span>
            <h2 className={styles.heading} id="wcu-heading">
              {data.headingStart} <span>{data.headingHighlight}</span>,<br />{data.headingEnd}
            </h2>
            <p className={styles.subtext}>{data.subtext}</p>
          </motion.div>

          <div className={styles.reasons}>
            {reasons.map((reason, i) => (
              <ReasonItem
                key={i}
                reason={reason}
                index={i}
                sectionInView={inView}
              />
            ))}
          </div>

          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, delay: reasons.length * 0.12 + 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
              },
            }}
          >
            <Link to={data.ctaLink ?? '/about'} className={styles.cta}>
              {data.ctaLabel ?? 'Meet Our Team'}
              <span className={styles.ctaArrow} aria-hidden="true">
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 5h6M5 2l3 3-3 3" />
                </svg>
              </span>
            </Link>
          </motion.div>

        </div>

        {/* ── RIGHT: media card ── */}
        <MediaCard media={data.media} />

      </div>
    </section>
  );
}
