// src/data/careers.js

// Departments used for filter pills
export const DEPARTMENTS = [
  "Architecture",
  "Engineering",
  "Project Management",
  "Interior Design",
  "Administration",
];

// Job types used for filter pills
export const JOB_TYPES = ["Full-time", "Contract", "Internship"];

// Job listings — replace placeholders with real SAGEC openings
const careers = [
  {
    id: "arch-001",
    title: "Senior Architect",
    department: "Architecture",
    location: "Kigali, Rwanda",
    type: "Full-time",
    description:
      "SAGEC is looking for a Senior Architect to lead design development on commercial and residential projects across Rwanda. You will work closely with clients, engineers, and project managers from concept through to completion, ensuring design integrity and regulatory compliance at every stage.",
    requirements: [
      "Bachelor's or Master's degree in Architecture",
      "Minimum 5 years of professional experience in architectural design",
      "Proficiency in AutoCAD, Revit, and SketchUp",
      "Strong understanding of Rwandan building codes and standards",
      "Excellent communication and client management skills",
      "Experience managing junior architects and design teams",
    ],
    applyEmail: "careers@sagec.rw",
    applyLink: "",
  },
  {
    id: "eng-001",
    title: "Structural Engineer",
    department: "Engineering",
    location: "Kigali, Rwanda",
    type: "Full-time",
    description:
      "We are seeking a Structural Engineer to deliver safe, efficient, and innovative structural designs for our growing portfolio of commercial, civic, and residential projects. The role involves structural analysis, preparation of engineering drawings, and site supervision.",
    requirements: [
      "Bachelor's degree in Civil or Structural Engineering",
      "Minimum 4 years of structural engineering experience",
      "Proficiency in SAP2000, ETABS, or equivalent structural analysis software",
      "Knowledge of local and international structural codes (Eurocode preferred)",
      "Ability to produce detailed engineering drawings and reports",
    ],
    applyEmail: "careers@sagec.rw",
    applyLink: "",
  },
  {
    id: "pm-001",
    title: "Project Manager",
    department: "Project Management",
    location: "Kigali, Rwanda",
    type: "Full-time",
    description:
      "SAGEC requires an experienced Project Manager to oversee construction projects from mobilisation through to handover. You will be responsible for timeline management, budget control, contractor coordination, and client reporting across multiple active sites.",
    requirements: [
      "Degree in Civil Engineering, Construction Management, or related field",
      "Minimum 6 years of project management experience in construction",
      "PMP or PRINCE2 certification is an advantage",
      "Strong knowledge of construction contracts and procurement",
      "Excellent leadership and stakeholder management skills",
      "Proficiency in MS Project or Primavera P6",
    ],
    applyEmail: "careers@sagec.rw",
    applyLink: "",
  },
  {
    id: "int-001",
    title: "Interior Designer",
    department: "Interior Design",
    location: "Kigali, Rwanda",
    type: "Full-time",
    description:
      "We are looking for a talented Interior Designer to join our multidisciplinary team. You will develop interior concepts and detailed designs for hospitality, commercial, and residential projects, working closely with architects and clients to deliver exceptional spaces.",
    requirements: [
      "Degree or diploma in Interior Design or Architecture",
      "Minimum 3 years of professional interior design experience",
      "Strong portfolio demonstrating commercial and hospitality projects",
      "Proficiency in AutoCAD, 3ds Max, and Adobe Creative Suite",
      "Excellent eye for detail, materials, and finishes",
    ],
    applyEmail: "careers@sagec.rw",
    applyLink: "",
  },
  {
    id: "eng-002",
    title: "MEP Engineer",
    department: "Engineering",
    location: "Kigali, Rwanda",
    type: "Contract",
    description:
      "SAGEC is seeking a skilled MEP Engineer for a contract engagement on a major commercial development in Kigali. You will be responsible for the design and coordination of mechanical, electrical, and plumbing systems, ensuring integration with architectural and structural works.",
    requirements: [
      "Degree in Mechanical, Electrical, or Building Services Engineering",
      "Minimum 4 years of MEP design experience",
      "Experience with BIM coordination and clash detection",
      "Knowledge of HVAC, fire protection, and low-voltage systems",
      "Ability to work to tight deadlines in a fast-paced environment",
    ],
    applyEmail: "careers@sagec.rw",
    applyLink: "",
  },
  {
    id: "adm-001",
    title: "Administrative Assistant",
    department: "Administration",
    location: "Kigali, Rwanda",
    type: "Full-time",
    description:
      "We are looking for a highly organised Administrative Assistant to support our Kigali headquarters. You will handle office operations, correspondence, scheduling, and document management, playing a key role in keeping SAGEC running smoothly.",
    requirements: [
      "Diploma or degree in Business Administration or related field",
      "Minimum 2 years of office administration experience",
      "Excellent written and spoken English and Kinyarwanda",
      "Proficiency in Microsoft Office Suite",
      "Strong organisational skills and attention to detail",
      "Professional, discreet, and reliable",
    ],
    applyEmail: "careers@sagec.rw",
    applyLink: "",
  },
  {
    id: "arch-002",
    title: "Architecture Intern",
    department: "Architecture",
    location: "Kigali, Rwanda",
    type: "Internship",
    description:
      "SAGEC offers a structured internship programme for architecture students and recent graduates. You will gain hands-on experience working alongside our senior architects on live projects, developing your technical and professional skills in a leading Rwandan firm.",
    requirements: [
      "Currently enrolled in or recently graduated from an Architecture programme",
      "Basic proficiency in AutoCAD and SketchUp",
      "Eagerness to learn and contribute in a professional environment",
      "Strong attention to detail and design sensibility",
    ],
    applyEmail: "careers@sagec.rw",
    applyLink: "",
  },
];

export default careers;