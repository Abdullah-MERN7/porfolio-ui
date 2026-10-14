import type {
  ContactMessageDocument,
  ExperienceDocument,
  ProjectDocument,
  SkillDocument,
  CertificationDocument,
  HeroContentDocument,
  AboutContentDocument,
  FeatureDocument,
  SiteIdentityDocument,
} from "@/src/models";

import type {
  AboutContent,
  Certification,
  ContactMessage,
  Experience,
  Feature,
  HeroContent,
  HeroPalette,
  Project,
  SiteIdentity,
  Skill,
} from "@/src/types/portfolio";

const DEFAULT_HERO_PALETTE: HeroPalette = {
  primary: "#F15BB5",
  secondary: "#4361EE",
  accent: "#2A9D8F",
  particles: "#2A9D8F",
};

export function serializeSkill(doc: SkillDocument): Skill {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    category: doc.category,
    level: doc.level,
    iconUrl: doc.iconUrl ?? undefined,
    order: doc.order ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeProject(doc: ProjectDocument): Project {
  const gallery = doc.gallery && doc.gallery.length
    ? doc.gallery
    : doc.imageUrl
      ? [doc.imageUrl]
      : [];
  return {
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    techStack: doc.techStack ?? [],
    gallery,
    coverImage: gallery[0] ?? "",
    liveUrl: doc.liveUrl ?? undefined,
    repoUrl: doc.repoUrl ?? undefined,
    featured: doc.featured,
    order: doc.order ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeExperience(doc: ExperienceDocument): Experience {
  return {
    _id: doc._id.toString(),
    company: doc.company,
    role: doc.role,
    startDate: doc.startDate.toISOString(),
    endDate: doc.endDate ? doc.endDate.toISOString() : undefined,
    isCurrent: doc.isCurrent,
    achievements: doc.achievements ?? [],
    techStack: doc.techStack ?? [],
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeContactMessage(
  doc: ContactMessageDocument
): ContactMessage {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    email: doc.email ?? undefined,
    phone: doc.phone ?? undefined,
    message: doc.message,
    channel: doc.channel ?? "contact-form",
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeCertification(
  doc: CertificationDocument
): Certification {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    issuer: doc.issuer ?? undefined,
    description: doc.description ?? undefined,
    imageUrl: doc.imageUrl,
    credentialUrl: doc.credentialUrl ?? undefined,
    startDate: doc.startDate.toISOString(),
    endDate: doc.endDate ? doc.endDate.toISOString() : undefined,
    order: doc.order ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeHeroContent(doc: HeroContentDocument): HeroContent {
  const palette = (doc.palette as any) || DEFAULT_HERO_PALETTE;
  return {
    _id: doc._id.toString(),
    badge: doc.badge,
    headline: doc.headline,
    description: doc.description,
    primaryCtaLabel: doc.primaryCtaLabel,
    primaryCtaHref: doc.primaryCtaHref,
    secondaryCtaLabel: doc.secondaryCtaLabel,
    secondaryCtaHref: doc.secondaryCtaHref,
    linkedinHref: (doc as any).linkedinHref ?? "https://www.linkedin.com/in/abdullah-mern/",
    palette: {
      primary: palette.primary ?? DEFAULT_HERO_PALETTE.primary,
      secondary: palette.secondary ?? DEFAULT_HERO_PALETTE.secondary,
      accent: palette.accent ?? DEFAULT_HERO_PALETTE.accent,
      particles: palette.particles ?? DEFAULT_HERO_PALETTE.particles,
    },
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeAboutContent(
  doc: AboutContentDocument
): AboutContent {
  return {
    _id: doc._id.toString(),
    heading: doc.heading,
    paragraphs: Array.isArray(doc.paragraphs)
      ? doc.paragraphs.filter((paragraph): paragraph is string => Boolean(paragraph))
      : [],
    resumeLabel: doc.resumeLabel,
    resumeUrl: doc.resumeUrl,
    secondaryLabel: doc.secondaryLabel ?? undefined,
    secondaryUrl: doc.secondaryUrl ?? undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
export function serializeFeature(doc: FeatureDocument): Feature {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    icon: doc.icon,
    order: doc.order ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeSiteIdentity(doc: SiteIdentityDocument): SiteIdentity {
  return {
    _id: doc._id.toString(),
    brandName: doc.brandName,
    brandTagline: doc.brandTagline ?? undefined,
    brandDescription: doc.brandDescription ?? undefined,
    brandLogoUrl: doc.brandLogoUrl ?? undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}