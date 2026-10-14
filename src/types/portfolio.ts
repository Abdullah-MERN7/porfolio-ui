export type Skill = {
  _id: string;
  name: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  iconUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  gallery: string[];
  coverImage: string;
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type Experience = {
  _id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  achievements: string[];
  techStack: string[];
  createdAt: string;
  updatedAt: string;
};

export type ContactMessage = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  channel: "contact-form" | "whatsapp";
  status: "new" | "read";
  createdAt: string;
  updatedAt: string;
};

export type Certification = {
  _id: string;
  title: string;
  issuer?: string;
  description?: string;
  imageUrl: string;
  credentialUrl?: string;
  startDate: string;
  endDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type HeroPalette = {
  primary: string;
  secondary: string;
  accent: string;
  particles: string;
};

export type HeroContent = {
  _id: string;
  badge: string;
  headline: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  linkedinHref?: string;
  palette: HeroPalette;
  createdAt: string;
  updatedAt: string;
};

export type AboutContent = {
  _id: string;
  heading: string;
  paragraphs: string[];
  resumeLabel: string;
  resumeUrl: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  createdAt: string;
  updatedAt: string;
};
export type Feature = {
  _id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type SiteIdentity = {
  _id: string;
  brandName: string;
  brandTagline?: string;
  brandDescription?: string;
  brandLogoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};


export type PortfolioSummary = {
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
  features: Feature[];
  hero?: HeroContent;
  about?: AboutContent;
  site?: SiteIdentity;
};
