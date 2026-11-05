// src/data/featuredProjects.js
// Each project supports 1–5 images in the `images` array.
// The photo slider only renders dot indicators when images.length > 1.
// `description` is hard-clamped to 2 lines in CSS — keep it concise.

const featuredProjects = [
  {
    id: "silverback-mall",
    title: "Silverback Mall",
    category: "Commercial",
    location: "Kigali",
    year: "2022",
    description:
      "A landmark retail and mixed-use complex redefining Kigali's commercial landscape with modern design and structural excellence.",
    images: [
      "/images/projects/silverback-mall/featured.jpg",
      "/images/projects/silverback-mall/gallery-1.jpg",
      "/images/projects/silverback-mall/cover.webp",
    ],
    link: "/projects/silverback-mall",
    featured: true,
  },
  {
    id: "florida-house",
    title: "Florida House",
    category: "Residential",
    location: "Kigali",
    year: "2021",
    description:
      "A premium residential development blending contemporary architecture with the natural contours of Kigali's hillside terrain.",
    images: [
      "/images/projects/florida-house/cover.jpeg",
      "/images/projects/florida-house/featured.jpeg",
    ],
    link: "/projects/florida-house",
    featured: false,
  },
  {
    id: "lemigo-hotel",
    title: "Lemigo Hotel Interior",
    category: "Interior",
    location: "Kigali",
    year: "2020",
    description:
      "Full interior fit-out for one of Kigali's premier hotels, crafting refined spaces that balance elegance with functional hospitality.",
    images: [
      "/images/projects/lemigo-hotel/featured.jpeg",
      "/images/projects/lemigo-hotel/gallery-2.jpeg",
      "/images/projects/lemigo-hotel/cover.jpeg",
      "/images/projects/lemigo-hotel/gallery-1.jpeg",
    ],
    link: "/projects/lemigo-hotel",
    featured: false,
  },
  {
    id: "tcb-house",
    title: "TCB House",
    category: "Civic",
    location: "Kigali, Rwanda",
    year: "2021",
    description:
      "Institutional headquarters for the Rwanda Governance Board, delivering a civic presence that projects authority and transparency.",
    images: [
      "/images/projects/tcb-house/cover.jpeg",
      "/images/projects/tcb-house/featured.jpeg",
    ],
    link: "/projects/tcb-house",
    featured: false,
  },
  {
    id: "project-five",
    title: "G&D House",
    category: "Commercial",
    location: "Kigali",
    year: "2023",
    description:
      "A contemporary office complex engineered for sustainability and collaborative workspaces in the heart of the city.",
    images: [
      "/images/projects/gd-house/cover.jpeg",
      "/images/projects/gd-house/featured.jpeg",
    ],
    link: "/projects/gd-house",
    featured: false,
  },
  {
    id: "project-six",
    title: "Hall Mark Center",
    category: "Engineering",
    location: "Kigali",
    year: "2022",
    description:
      "Structural and MEP engineering works for Kigali's flagship innovation hub, supporting Africa's growing tech ecosystem.",
    images: [
      "/images/projects/hall-mark-center/cover.jpeg",
      "/images/projects/hall-mark-center/featured.jpeg",
    ],
    link: "/projects/hall-mark-center",
    featured: false,
  },
];

export default featuredProjects;