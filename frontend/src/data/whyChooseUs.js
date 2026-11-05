// src/data/whyChooseUs.js

export const reasons = [
  {
    id: "experience",
    title: "20+ Years of Proven Experience",
    description:
      "Two decades of delivering landmark structures across Rwanda, from commercial towers to civic institutions.",
  },
  {
    id: "quality",
    title: "International Quality Standards",
    description:
      "Every project meets rigorous engineering benchmarks, ensuring safety, durability, and long-term value.",
  },
  {
    id: "local",
    title: "Deep Local Expertise",
    description:
      "Unmatched knowledge of Kigali's terrain, regulations, and supply chain — no learning curve, no surprises.",
  },
  {
    id: "team",
    title: "Multidisciplinary Expert Team",
    description:
      "Architects, structural engineers, and project managers working as one integrated unit on every build.",
  },
  {
    id: "delivery",
    title: "On-Time, On-Budget Delivery",
    description:
      "A disciplined project management process that consistently meets deadlines and respects agreed budgets.",
  },
  {
    id: "trust",
    title: "Trusted by Rwanda's Leaders",
    description:
      "Chosen by government bodies, major investors, and private developers for projects that cannot afford failure.",
  },
];

// ── Section background (parallax layer behind everything) ──────
// Always an image. Leave src empty until you have a real photo.
// Recommended: a wide, high-res aerial or construction site shot.
export const sectionBackground = {
  src: "/assets/why-choose-us-bg.jpg",   // e.g. "/assets/why-choose-us-bg.jpg"
  alt: "",
};

// ── Right column card media (independent from the background) ──
// Set type to "image" or "video".
// For video: provide a poster image shown before playback starts.
// Leave src empty to show the placeholder card.
export const cardMedia = {
  type: "image",    // "image" | "video"
  src: "/assets/sagec-team.jpg",          // e.g. "/assets/sagec-team.jpg" or "/assets/site-reel.mp4"
  poster: "/assets/site-reel.mp4",       // used only when type === "video"
  alt: "SAGEC construction team at work on a Kigali project",
};