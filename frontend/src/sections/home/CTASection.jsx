// src/sections/home/CTASection/index.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "@hooks/useInView";
import { useHomePage } from "@hooks/useHomePage";
import { useCompanyInfo } from "@hooks/useCompanyInfo";
import styles from "./CTASection.module.css";

// ─── Animation variant — card + all content fade up together ───
const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Inline arrow SVG reused by both buttons ───────────────────
function ArrowIcon() {
  return (
    <span className={styles.btnArrow} aria-hidden="true">
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
  );
}

// ─── Main section ──────────────────────────────────────────────
export default function CTASection() {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const { data: cta } = useHomePage((home) => home.cta);
  const { data: company } = useCompanyInfo();

  const phone = company?.phone ?? '(+250) 788 470 243'
  const email = company?.email ?? 'sagecltd@gmail.com'
  const address = company?.address ?? 'Kigali, Rwanda'
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, '')}`

  if (!cta) return null

  return (
    <section
      className={styles.section}
      aria-labelledby="cta-heading"
    >
      <div className={styles.container}>
        <motion.div
          ref={ref}
          className={styles.card}
          variants={cardVariant}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Eyebrow */}
          <span className={styles.eyebrow}>{cta.eyebrow}</span>

          {/* Headline */}
          <h2 className={styles.heading} id="cta-heading">
            {cta.headingStart} <span>{cta.headingHighlight}</span> {cta.headingEnd}
          </h2>

          {/* Supporting line */}
          <p className={styles.subtext}>{cta.subline}</p>

          {/* Buttons */}
          <div className={styles.buttons}>
            <Link to={cta.primaryBtnLink ?? '/contact'} className={styles.btnPrimary}>
              {cta.primaryBtnLabel ?? 'Start a Project'}
              <ArrowIcon />
            </Link>

            <Link to={cta.secondaryBtnLink ?? '/projects'} className={styles.btnSecondary}>
              {cta.secondaryBtnLabel ?? 'View Our Work'}
              <ArrowIcon />
            </Link>
          </div>

          {/* Contact nudge — phone + email + location */}
          <div className={styles.contactNudge}>
            {/* Phone */}
            <a
              href={phoneHref}
              className={styles.nudgeItem}
              aria-label="Call SAGEC"
            >
              <svg
                className={styles.nudgeIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {phone}
            </a>

            <div className={styles.nudgeDivider} aria-hidden="true" />

            {/* Email */}
            <a
              href={`mailto:${email}`}
              className={styles.nudgeItem}
              aria-label="Email SAGEC"
            >
              <svg
                className={styles.nudgeIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {email}
            </a>

            <div className={styles.nudgeDivider} aria-hidden="true" />

            {/* Location */}
            <span className={styles.nudgeItem}>
              <svg
                className={styles.nudgeIcon}
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
              {address}
            </span>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
