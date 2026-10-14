import { AboutSection } from "@/components/sections/About";
import { CertificationsSection } from "@/components/sections/CertificationsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import {
  getAboutContent,
  getCertifications,
  getExperience,
  getFeatures,
  getHeroContent,
  getProjects,
  getSkills,
} from "@/src/lib/portfolioService";
import { ABOUT_CONTENT_FALLBACK, FEATURES_FALLBACK, HERO_CONTENT_FALLBACK } from "@/src/lib/defaultContent";

function loadOrFallback<T>(
  label: string,
  load: Promise<T>,
  fallback: T
): Promise<T> {
  return load.catch((error: unknown) => {
    console.error(`Failed to load ${label} from the database`, error);
    return fallback;
  });
}

export default async function Home() {
  const [
    skills,
    projects,
    experience,
    certifications,
    heroContent,
    aboutContent,
    features,
  ] = await Promise.all([
    loadOrFallback("skills", getSkills(), []),
    loadOrFallback("projects", getProjects(), []),
    loadOrFallback("experience", getExperience(), []),
    loadOrFallback("certifications", getCertifications(), []),
    loadOrFallback("hero content", getHeroContent(), HERO_CONTENT_FALLBACK),
    loadOrFallback("about content", getAboutContent(), ABOUT_CONTENT_FALLBACK),
    loadOrFallback("features", getFeatures(), FEATURES_FALLBACK),
  ]);

  return (
    <div className="relative pb-24" suppressHydrationWarning>
      <HeroSection content={heroContent} />
      <FeaturesSection features={features} />
      <AboutSection content={aboutContent} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <CertificationsSection certifications={certifications} />
      <TestimonialsSection />
      <ExperienceSection experience={experience} />
      <ContactSection />
    </div>
  );
}


