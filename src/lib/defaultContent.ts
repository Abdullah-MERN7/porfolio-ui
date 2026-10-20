import type { AboutContent, Feature, HeroContent, SiteIdentity } from "@/src/types/portfolio";
import type {
  AboutContentPayload,
  FeaturePayload,
  HeroContentPayload,
  SiteIdentityPayload,
} from "./validators";

export const SITE_IDENTITY_SEED: SiteIdentityPayload = {
  brandName: "DevPortfolio",
  brandTagline: "Thoughtful digital experiences",
  brandDescription:
    "Building thoughtful digital experiences for forward-looking teams.",
};

export const FEATURE_SEED: FeaturePayload[] = [
  {
    title: "Performance-first builds",
    description:
      "Ship fast experiences with edge rendering, ISR, and fine-grained caching tailored to your product roadmap.",
    icon: "gauge-circle",
    order: 0,
  },
  {
    title: "Design systems that scale",
    description:
      "Craft cohesive component libraries that balance accessibility, branding, and developer velocity.",
    icon: "figma",
    order: 1,
  },
  {
    title: "Full-stack architecture",
    description:
      "From schema design to CI/CD, I connect the dots across databases, APIs, and delightful front-end interactions.",
    icon: "code",
    order: 2,
  },
  {
    title: "AI-assisted workflows",
    description:
      "Automate routine ops with AI-powered tooling, from content pipelines to intelligent search interfaces.",
    icon: "brain",
    order: 3,
  },
  {
    title: "Security baked in",
    description:
      "Implement sensible guardrails: role-based auth, rate limiting, and observability to keep data and users safe.",
    icon: "shield-check",
    order: 4,
  },
  {
    title: "Delightful polish",
    description:
      "Micro-interactions, motion, and storytelling that make complex flows feel effortless and on-brand.",
    icon: "sparkles",
    order: 5,
  },
];

export const HERO_CONTENT_SEED: HeroContentPayload = {
  badge: "Full-Stack Developer",
  headline: "Building performant web experiences that scale with your ideas.",
  description:
    "I'm Alex Carter, a product-focused developer crafting immersive and accessible digital products with React, Next.js, and cloud-native tooling.",
  primaryCtaLabel: "View Projects",
  primaryCtaHref: "#projects",
  secondaryCtaLabel: "LinkedIn",
  secondaryCtaHref: "https://www.linkedin.com/in/abdullah-mern/",
  palette: {
    primary: "#F15BB5",
    secondary: "#4361EE",
    accent: "#2A9D8F",
    particles: "#2A9D8F",
  },
};

export const ABOUT_CONTENT_SEED: AboutContentPayload = {
  heading: "About",
  paragraphs: [
    "I'm a software engineer focused on building resilient, elegantly designed products. Over the past six years I've built design systems, SaaS platforms, and developer tooling for teams across finance, education, and cloud infrastructure. I thrive working end to end, from product discovery to shipping production-grade features.",
    "When I'm not coding you'll find me exploring creative coding, prototyping new ideas, or mentoring early-career developers.",
  ],
  resumeLabel: "Download CV",
  resumeUrl: "/resume.pdf",
  secondaryLabel: "Schedule a call ->",
  secondaryUrl: "https://cal.com/",
};

export const SITE_IDENTITY_FALLBACK: SiteIdentity = {
  _id: "site-default",
  ...SITE_IDENTITY_SEED,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export const FEATURES_FALLBACK: Feature[] = FEATURE_SEED.map((feature, index) => ({
  _id: `feature-${index}`,
  title: feature.title,
  description: feature.description,
  icon: feature.icon,
  order: feature.order ?? index,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
}));

export const HERO_CONTENT_FALLBACK: HeroContent = {
  _id: "hero-default",
  ...HERO_CONTENT_SEED,
  palette: {
    primary: HERO_CONTENT_SEED.palette?.primary ?? "#F15BB5",
    secondary: HERO_CONTENT_SEED.palette?.secondary ?? "#4361EE",
    accent: HERO_CONTENT_SEED.palette?.accent ?? "#2A9D8F",
    particles: HERO_CONTENT_SEED.palette?.particles ?? "#2A9D8F",
  },
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export const ABOUT_CONTENT_FALLBACK: AboutContent = {
  _id: "about-default",
  ...ABOUT_CONTENT_SEED,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};