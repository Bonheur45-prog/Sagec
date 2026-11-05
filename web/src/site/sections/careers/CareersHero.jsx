'use client';

// src/sections/careers/CareersHero.jsx
import { motion } from "framer-motion";
import { useCareersPage, useJobs } from "@hooks/useCareers";
import styles from "./CareersHero.module.css";

const containerVariant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariant = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Wraps the first occurrence of `highlight` inside `text` in a <span>
// (styled orange by the existing CSS). Falls back to plain text if the
// highlight is empty or doesn't appear in the headline.
function Headline({ text, highlight }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at)}
      <span>{highlight}</span>
      {text.slice(at + highlight.length)}
    </>
  );
}

export default function CareersHero() {
  const { data: page } = useCareersPage();
  const { data: jobs, isSuccess: jobsLoaded } = useJobs();
  const openCount = jobs?.length ?? 0;

  const eyebrow   = page?.eyebrow ?? "Join Our Team";
  const headline  = page?.headline ?? "Build Rwanda\u2019s Future With Us";
  const highlight = page ? page.headlineHighlight : "Future";
  const subline   =
    page?.subline ??
    "SAGEC is always looking for talented architects, engineers, and construction professionals who are passionate about shaping Rwanda\u2019s built environment.";

  return (
    <section className={styles.section} aria-labelledby="careers-hero-heading">
      <div className={styles.container}>
        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="visible"
        >
          <motion.span className={styles.eyebrow} variants={itemVariant}>
            {eyebrow}
          </motion.span>

          <motion.h1
            className={styles.heading}
            id="careers-hero-heading"
            variants={itemVariant}
          >
            <Headline text={headline} highlight={highlight} />
          </motion.h1>

          <motion.p className={styles.subline} variants={itemVariant}>
            {subline}
          </motion.p>

          {/* Count only shown once real data is in — never a misleading "0" while loading */}
          {jobsLoaded && openCount > 0 && (
            <motion.div variants={itemVariant}>
              <span className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {openCount} open position{openCount !== 1 ? "s" : ""}
              </span>
            </motion.div>
          )}

          <motion.div
            className={styles.divider}
            variants={itemVariant}
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  );
}