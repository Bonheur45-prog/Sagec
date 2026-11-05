'use client';

// src/components/layout/Footer/index.jsx
import { Link } from '@site/router';
import { useCompanyInfo } from "@hooks/useCompanyInfo";
import { useSiteChrome } from "./site-chrome";
import styles from "./Footer.module.css";

// ─── Static data — update with real SAGEC details ─────────────
const QUICK_LINKS = [
  { label: "Home",         to: "/" },
  { label: "About Us",     to: "/about" },
  { label: "Services",     to: "/services" },
  { label: "Projects",     to: "/projects" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "Careers",      to: "/careers" },
  { label: "News",         to: "/news" },
  { label: "Contact",      to: "/contact" },
];

const SERVICES = [
  { label: "Architecture",          to: "/services" },
  { label: "Structural Engineering", to: "/services" },
  { label: "Interior Design",        to: "/services" },
  { label: "Project Management",     to: "/services" },
  { label: "MEP Engineering",        to: "/services" },
  { label: "Construction",           to: "/services" },
];

// Contact items are built inside Footer() from CompanyInfo — see
// buildContactItems() below. Icons are still rendered by id here.

// Renders the correct SVG icon per contact item id
function ContactIcon({ id }) {
  const cls = styles.contactIcon;
  const base = { viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":"true" };
  if (id === "address") return (
    <svg className={cls} {...base}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
  if (id === "phone") return (
    <svg className={cls} {...base}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
  if (id === "email") return (
    <svg className={cls} {...base}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  if (id === "hours") return (
    <svg className={cls} {...base}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
  return null;
}

// Builds the CONTACT list from CompanyInfo — single source of truth,
// no longer duplicated (and drifting out of sync) with the values
// used elsewhere on the site (ContactMain.jsx, CTASection.jsx).
function buildContactItems(company) {
  if (!company) return []
  const hours = (company.businessHours ?? [])
    .map((row) => `${row.day}: ${row.hours}`)
    .join('\n')
  return [
    { id: 'address', content: company.address, href: null },
    { id: 'phone', content: company.phone, href: `tel:${(company.phone ?? '').replace(/[^+\d]/g, '')}` },
    { id: 'email', content: company.email, href: `mailto:${company.email}` },
    { id: 'hours', content: hours, href: null },
    // FIX: before CompanyInfo is seeded/filled in, any of these fields can
    // be blank — without this filter, an item with `content: undefined`
    // reaches the render below and crashes on `.split()`.
  ].filter((item) => item.content)
}

// ─── Social media icons ────────────────────────────────────────
// Icon-only lookup by iconKey — href/label now come from CompanyInfo
// (see buildSocialLinks() below), matching the CompanyInfo `socials`
// select field's options exactly.
const SOCIAL_ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  x: (
    // X (formerly Twitter) logo — two crossing lines
    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
}

const SOCIAL_LABELS = {
  instagram: 'SAGEC on Instagram',
  linkedin: 'SAGEC on LinkedIn',
  x: 'SAGEC on X',
  facebook: 'SAGEC on Facebook',
}

// Builds the rendered social links list from CompanyInfo's `socials`
// array (iconKey + href), pairing each with its icon/label above.
function buildSocialLinks(company) {
  return (company?.socials ?? [])
    .filter((s) => SOCIAL_ICONS[s.iconKey])
    .map((s) => ({ id: s.iconKey, href: s.href, label: SOCIAL_LABELS[s.iconKey], icon: SOCIAL_ICONS[s.iconKey] }))
}

// ─── Footer component ──────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();
  // Columns, copyright and credit from CMS → Footer; services from CMS → Services (published, in order).
  const { footer, legalName, services } = useSiteChrome();
  const quickLinks = footer?.quickLinks?.length ? footer.quickLinks.map((l) => ({ label: l.label, to: l.url, newTab: l.newTab })) : QUICK_LINKS;
  const serviceLinks = services?.length ? services.map((sv) => ({ label: sv.title, to: `/services/${sv.slug}` })) : SERVICES;
  const showServices = footer ? footer.showServices : true;
  const copyright = (footer?.copyright || `© {year} ${legalName || "SAGEC Ltd"}. All rights reserved.`).replaceAll("{year}", String(year));
  const credit = footer ? footer.credit : { prefix: "Built by", name: "BONHEUR NSHIMIYIMANA", url: "" };
  const { data: company } = useCompanyInfo()
  const contactItems = buildContactItems(company)
  const socialLinks = buildSocialLinks(company)

  return (
    <footer className={styles.footer}>

      {/* ── 4-column main area ── */}
      <div className={styles.main}>

        {/* Col 1: Logo + description + socials */}
        <div className={styles.col}>
          <Link to="/" className={styles.logoWrap} aria-label="SAGEC home">
            <img src="/logo-color-foot.png" alt="SAGEC Ltd" className={styles.logoMark} />
          </Link>

          <p className={styles.description}>
            {company?.tagline ?? 'Delivering landmark architectural and engineering construction projects across Rwanda and East Africa — built to last, designed to inspire.'}
          </p>

          <div className={styles.socials} role="list" aria-label="Social media links">
            {socialLinks.map((s) => (
              <a
                key={s.id}
                href={s.href}
                className={styles.socialBtn}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                role="listitem"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Quick links */}
        <div className={styles.col}>
          <h3 className={styles.colHeading}>{footer?.quickLinksHeading || "Quick Links"}</h3>
          <ul className={styles.linkList}>
            {quickLinks.map((l, i) => (
              <li key={`${l.to}-${i}`}>
                <Link to={l.to} {...(l.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Services */}
        {showServices && (
        <div className={styles.col}>
          <h3 className={styles.colHeading}>{footer?.servicesHeading || "Our Services"}</h3>
          <ul className={styles.linkList}>
            {serviceLinks.map((s) => (
              <li key={s.label}>
                <Link to={s.to}>{s.label}</Link>
              </li>
            ))}
          </ul>
          <Link to="/services" className={styles.viewAllLink}>
            View all services
            <svg
              width="14"
              height="14"
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
        )}

        {/* Col 4: Contact */}
        <div className={styles.col}>
          <h3 className={styles.colHeading}>{footer?.contactHeading || "Get In Touch"}</h3>
          <ul className={styles.contactList}>
            {contactItems.map((item) => (
              <li key={item.id} className={styles.contactItem}>
                <ContactIcon id={item.id} />
                {item.href ? (
                  <a href={item.href} className={styles.contactText}>
                    {item.content}
                  </a>
                ) : (
                  <span className={styles.contactText}>
                    {/* Preserve newlines in hours text */}
                    {item.content.split("\n").map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span className={styles.copyright}>
            {copyright}
            {footer?.legalLinks?.map((l, i) => (
              <span key={`${l.url}-${i}`}>
                {" · "}
                <Link to={l.url} {...(l.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{l.label}</Link>
              </span>
            ))}
          </span>
          {credit?.name && (
            <span className={styles.builtBy}>
              {credit.prefix}{" "}
              {credit.url ? (
                <a href={credit.url} target="_blank" rel="noopener noreferrer">
                  {credit.name}
                </a>
              ) : (
                credit.name
              )}
            </span>
          )}
        </div>
      </div>

    </footer>
  );
}
