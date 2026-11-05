// src/sections/careers/OpenPositions/index.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import careers, { DEPARTMENTS, JOB_TYPES } from "@data/careers";
import styles from "./OpenPositions.module.css";

// ─── Job detail modal ──────────────────────────────────────────
function JobModal({ job, onClose }) {
  const modalRef = useRef(null);
  const closeRef = useRef(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Focus the close button on mount for accessibility
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Close when clicking the overlay (not the modal card itself)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick}
    >
      <div className={styles.modal} ref={modalRef}>
        {/* Close button */}
        <button
          ref={closeRef}
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close job details"
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1"  y2="13" />
          </svg>
        </button>

        <div className={styles.modalInner}>
          {/* Meta badges */}
          <div className={styles.modalMeta}>
            <span className={styles.deptBadge}>{job.department}</span>
            <span className={styles.typeBadge}>{job.type}</span>
          </div>

          {/* Title */}
          <h2 className={styles.modalTitle} id="modal-title">
            {job.title}
          </h2>

          {/* Location */}
          <div className={styles.modalLocation}>
            <svg
              className={styles.locationIcon}
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
            {job.location}
          </div>

          {/* Orange gradient divider */}
          <div className={styles.modalDivider} aria-hidden="true" />

          {/* Description */}
          <p className={styles.modalSectionLabel}>About the Role</p>
          <p className={styles.modalDesc}>{job.description}</p>

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <>
              <p className={styles.modalSectionLabel}>Requirements</p>
              <ul className={styles.reqList}>
                {job.requirements.map((req, i) => (
                  <li key={i} className={styles.reqItem}>
                    <span className={styles.reqBullet} aria-hidden="true" />
                    {req}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* How to apply */}
          <p className={styles.modalSectionLabel}>How to Apply</p>
          <div className={styles.applyBox}>
            <p className={styles.applyText}>
              Send your CV and a brief cover letter to our HR team. We review
              all applications and will be in touch if your profile matches
              our requirements.
            </p>
            <div className={styles.applyLinks}>
              {job.applyEmail && (
                <a
                  href={`mailto:${job.applyEmail}?subject=Application: ${encodeURIComponent(job.title)}`}
                  className={styles.applyEmailBtn}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Apply via Email
                </a>
              )}
              {job.applyLink && (
                <a
                  href={job.applyLink}
                  className={styles.applyExternalBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply Online
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8h10M8 3l5 5-5 5"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Single job card ───────────────────────────────────────────
function JobCard({ job, onSelect }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.deptBadge}>{job.department}</span>
        <span className={styles.typeBadge}>{job.type}</span>
      </div>

      <h3 className={styles.cardTitle}>{job.title}</h3>

      <div className={styles.cardLocation}>
        <svg
          className={styles.locationIcon}
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
        {job.location}
      </div>

      <div className={styles.cardSpacer} />

      <button
        className={styles.viewBtn}
        onClick={() => onSelect(job)}
        aria-label={`View details for ${job.title}`}
      >
        View Details
      </button>
    </article>
  );
}


// ─── No positions at all ───────────────────────────────────────
// Renders when careers.js array is completely empty
function NoJobs() {
  return (
    <div className={styles.noJobs}>
      <svg
        className={styles.noJobsIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
      <h3 className={styles.noJobsHeading}>No Open Positions Right Now</h3>
      <p className={styles.noJobsText}>
        We don't have any open roles at the moment, but we're always
        interested in hearing from talented professionals. Send us your
        CV and we'll keep you in mind for future opportunities.
      </p>
      <Link to="/contact" className={styles.noJobsLink}>
        Get in Touch
        <svg
          width="14" height="14"
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
  );
}

// ─── Main section ──────────────────────────────────────────────
export default function OpenPositions() {
  const [activeDept, setActiveDept] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);

  const handleSelect = useCallback((job) => setSelectedJob(job), []);
  const handleClose  = useCallback(() => setSelectedJob(null), []);

  const resetFilters = () => {
    setActiveDept("All");
    setActiveType("All");
  };

  // Filter logic — both filters apply simultaneously
  const filtered = careers.filter((job) => {
    const deptMatch = activeDept === "All" || job.department === activeDept;
    const typeMatch = activeType === "All" || job.type === activeType;
    return deptMatch && typeMatch;
  });

  return (
    <section className={styles.section} aria-labelledby="positions-heading">
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.sectionHeading} id="positions-heading">
            Open Positions
          </h2>
          <p className={styles.sectionSub}>
            {filtered.length} position{filtered.length !== 1 ? "s" : ""} available
            {(activeDept !== "All" || activeType !== "All") && " matching your filters"}
          </p>
        </div>

        {/* If no jobs at all — show empty state, skip filters and grid */}
        {careers.length === 0 ? (
          <NoJobs />
        ) : (
          <>
        {/* Filter bar */}
        <div className={styles.filters}>
          {/* Department filter */}
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Department</span>
            {["All", ...DEPARTMENTS].map((dept) => (
              <button
                key={dept}
                className={`${styles.pill} ${activeDept === dept ? styles.pillActive : ""}`}
                onClick={() => setActiveDept(dept)}
                aria-pressed={activeDept === dept}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Job type filter */}
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Type</span>
            {["All", ...JOB_TYPES].map((type) => (
              <button
                key={type}
                className={`${styles.pill} ${activeType === type ? styles.pillActive : ""}`}
                onClick={() => setActiveType(type)}
                aria-pressed={activeType === type}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs grid */}
        <div className={styles.grid}>
          {filtered.length > 0 ? (
            filtered.map((job) => (
              <JobCard key={job.id} job={job} onSelect={handleSelect} />
            ))
          ) : (
            <div className={styles.empty}>
              <svg
                className={styles.emptyIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8"  x2="11" y2="14" />
                <line x1="8"  y1="11" x2="14" y2="11" />
              </svg>
              <p className={styles.emptyText}>
                No positions match your current filters.
              </p>
              <button className={styles.emptyReset} onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
        </>
        )}

      </div>

      {/* Modal — rendered outside the grid but inside the section */}
      {selectedJob && (
        <JobModal job={selectedJob} onClose={handleClose} />
      )}
    </section>
  );
}