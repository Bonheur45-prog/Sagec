// src/sections/careers/CareersHero/index.jsx
import { motion } from "framer-motion";
import careers from "@data/careers";
import styles from "./CareersHero.module.css";

const containerVariant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariant = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function CareersHero() {
  const openCount = careers.length;

  return (
    <section className={styles.section} aria-labelledby="careers-hero-heading">
      <div className={styles.container}>
        <motion.div
          variants={containerVariant}
          initial="hidden"
          animate="visible"
        >
          <motion.span className={styles.eyebrow} variants={itemVariant}>
            Join Our Team
          </motion.span>

          <motion.h1
            className={styles.heading}
            id="careers-hero-heading"
            variants={itemVariant}
          >
            Build Rwanda's <span>Future</span> With Us
          </motion.h1>

          <motion.p className={styles.subline} variants={itemVariant}>
            SAGEC is always looking for talented architects, engineers, and
            construction professionals who are passionate about shaping
            Rwanda's built environment.
          </motion.p>

          <motion.div variants={itemVariant}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              {openCount} open position{openCount !== 1 ? "s" : ""}
            </span>
          </motion.div>

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