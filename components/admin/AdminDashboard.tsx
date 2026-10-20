"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";

import { ABOUT_CONTENT_FALLBACK, FEATURES_FALLBACK, HERO_CONTENT_FALLBACK, SITE_IDENTITY_FALLBACK } from "@/src/lib/defaultContent";
import type { FeatureIconKey } from "@/src/lib/featureIcons";
import { BrandingPanel } from "@/components/admin/panels/BrandingPanel";
import { FeaturesPanel } from "@/components/admin/panels/FeaturesPanel";

import type {
  AboutContent,
  Certification,
  ContactMessage,
  Experience,
  Feature,
  HeroContent,
  Project,
  SiteIdentity,
  Skill,
} from "@/src/types/portfolio";

type AdminTab =
  | "branding"
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "certifications"
  | "features"
  | "messages";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "branding", label: "Branding" },
  { id: "hero", label: "Hero" },
  { id: "features", label: "What I Bring" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "certifications", label: "Certifications" },
  { id: "messages", label: "Messages" },
];

const skillLevels: Skill["level"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

const sortFeaturesByOrder = (features: Feature[]): Feature[] => {
  return [...features].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.title.localeCompare(b.title);
  });
};

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImageFile(file: File, folder: string) {
  const base64 = await readFileAsDataUrl(file);

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file: base64,
      folder,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || "Image upload failed";
    throw new Error(message);
  }

  const data = payload?.data;
  if (!data?.url) {
    throw new Error("Upload response missing URL");
  }

  return data.url as string;
}

type RequestOptions = RequestInit & { suppressError?: boolean };

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("hero");
  const [siteIdentity, setSiteIdentity] = useState<SiteIdentity>(SITE_IDENTITY_FALLBACK);
  const [features, setFeatures] = useState<Feature[]>(FEATURES_FALLBACK);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCollection = useCallback(async <T,>(path: string): Promise<T> => {
    const response = await fetch(path, { cache: "no-store" });
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(extractMessage(payload, `Failed to fetch ${path}`));
    }

    return extractData<T>(payload);
  }, []);

  const request = useCallback(
    async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
      const { suppressError, headers, ...init } = options;
      const response = await fetch(path, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(headers as Record<string, string> | undefined),
        },
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const message = extractMessage(
          payload,
          `Request failed (${response.status})`
        );
        if (!suppressError) {
          throw new Error(message);
        }
        return extractData<T>(payload);
      }

      return extractData<T>(payload);
    },
    []
  );

  const scheduleStatusClear = useCallback(() => {
    window.setTimeout(() => {
      setStatusMessage(null);
    }, 2500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [
        skillsData,
        projectsData,
        experienceData,
        certificationData,
        messagesData,
        heroData,
        aboutData,
        featuresData,
        siteIdentityData,
      ] = await Promise.all([
        fetchCollection<Skill[]>("/api/skills"),
        fetchCollection<Project[]>("/api/projects"),
        fetchCollection<Experience[]>("/api/experience"),
        fetchCollection<Certification[]>("/api/certifications"),
        fetchCollection<ContactMessage[]>("/api/contact"),
        fetchCollection<HeroContent>("/api/hero"),
        fetchCollection<AboutContent>("/api/about"),
        fetchCollection<Feature[]>("/api/features"),
        fetchCollection<SiteIdentity>("/api/site"),
      ]);

      setSkills(skillsData);
      setProjects(projectsData);
      setExperience(experienceData);
      setCertifications(certificationData);
      setMessages(messagesData);
      setHeroContent(heroData ?? HERO_CONTENT_FALLBACK);
      setAboutContent(aboutData ?? ABOUT_CONTENT_FALLBACK);
      setFeatures(sortFeaturesByOrder(featuresData ?? []));
      setSiteIdentity(siteIdentityData ?? SITE_IDENTITY_FALLBACK);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load admin data."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchCollection]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateSkill = useCallback(
    async (payload: {
      name: string;
      category: string;
      level: Skill["level"];
      iconUrl?: string;
      order?: number;
    }) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Creating skill...");

      try {
        const skill = await request<Skill>("/api/skills", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSkills((prev) => [...prev, skill].sort((a, b) => a.order - b.order));
        setStatusMessage("Skill created successfully.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to create skill."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleDeleteSkill = useCallback(
    async (id: string) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Removing skill...");

      try {
        await request<unknown>(`/api/skills/${id}`, { method: "DELETE" });
        setSkills((prev) => prev.filter((skill) => skill._id !== id));
        setStatusMessage("Skill removed.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to remove skill."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleCreateProject = useCallback(
    async (payload: {
      title: string;
      description: string;
      techStack: string[];
      gallery: string[];
      liveUrl?: string;
      repoUrl?: string;
      featured: boolean;
      order?: number;
    }) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Creating project...");

      try {
        const project = await request<Project>("/api/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setProjects((prev) =>
          [...prev, project].sort((a, b) => a.order - b.order)
        );
        setStatusMessage("Project created successfully.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to create project."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleDeleteProject = useCallback(
    async (id: string) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Removing project...");

      try {
        await request<unknown>(`/api/projects/${id}`, { method: "DELETE" });
        setProjects((prev) => prev.filter((project) => project._id !== id));
        setStatusMessage("Project removed.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to remove project."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleCreateCertification = useCallback(
    async (payload: {
      title: string;
      issuer?: string;
      description?: string;
      imageUrl: string;
      credentialUrl?: string;
      startDate: string;
      endDate?: string | null;
      order?: number;
    }) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Creating certification...");

      try {
        const record = await request<Certification>("/api/certifications", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setCertifications((prev) =>
          [...prev, record].sort((a, b) => {
            if (a.order !== b.order) {
              return a.order - b.order;
            }
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          })
        );
        setStatusMessage("Certification added.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to create certification."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleDeleteCertification = useCallback(
    async (id: string) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Removing certification...");

      try {
        await request<unknown>(`/api/certifications/${id}`, { method: "DELETE" });
        setCertifications((prev) => prev.filter((item) => item._id !== id));
        setStatusMessage("Certification removed.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to remove certification."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleCreateExperience = useCallback(
    async (payload: {
      company: string;
      role: string;
      startDate: string;
      endDate?: string | null;
      isCurrent: boolean;
      achievements: string[];
      techStack: string[];
    }) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Creating experience...");

      try {
        const record = await request<Experience>("/api/experience", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setExperience((prev) =>
          [...prev, record].sort((a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          )
        );
        setStatusMessage("Experience entry created.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to create experience entry."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleDeleteExperience = useCallback(
    async (id: string) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Removing experience entry...");

      try {
        await request<unknown>(`/api/experience/${id}`, { method: "DELETE" });
        setExperience((prev) => prev.filter((record) => record._id !== id));
        setStatusMessage("Experience entry removed.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to remove experience entry."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleUpdateMessageStatus = useCallback(
    async (id: string, status: "new" | "read") => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Updating message status...");

      try {
        const updated = await request<ContactMessage>(`/api/contact/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });

        setMessages((prev) =>
          prev.map((message) => (message._id === id ? updated : message))
        );
        setStatusMessage("Message updated.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to update message."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleDeleteMessage = useCallback(
    async (id: string) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Deleting message...");

      try {
        await request<unknown>(`/api/contact/${id}`, { method: "DELETE" });
        setMessages((prev) => prev.filter((message) => message._id !== id));
        setStatusMessage("Message deleted.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to delete message."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );
  const handleSaveSiteIdentity = useCallback(
    async (payload: {
      brandName: string;
      brandTagline?: string | null;
      brandDescription?: string | null;
      brandLogoUrl?: string | null;
    }) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Saving branding...");

      try {
        const site = await request<SiteIdentity>("/api/site", {
          method: "PATCH",
          body: JSON.stringify({
            brandName: payload.brandName.trim(),
            brandTagline: payload.brandTagline?.trim() ?? "",
            brandDescription: payload.brandDescription?.trim() ?? "",
            brandLogoUrl:
              payload.brandLogoUrl && payload.brandLogoUrl.trim().length
                ? payload.brandLogoUrl.trim()
                : null,
          }),
        });
        setSiteIdentity(site);
        setStatusMessage("Branding updated.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to update branding."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleCreateFeature = useCallback(
    async (payload: {
      title: string;
      description: string;
      icon: FeatureIconKey;
      order?: number;
    }) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Adding feature...");

      try {
        const feature = await request<Feature>("/api/features", {
          method: "POST",
          body: JSON.stringify({
            title: payload.title.trim(),
            description: payload.description.trim(),
            icon: payload.icon,
            order: payload.order,
          }),
        });
        setFeatures((prev) => sortFeaturesByOrder([...prev, feature]));
        setStatusMessage("Feature added.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to add feature."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleUpdateFeature = useCallback(
    async (
      id: string,
      payload: Partial<{
        title: string;
        description: string;
        icon: FeatureIconKey;
        order?: number;
      }>
    ) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Updating feature...");

      try {
        const feature = await request<Feature>(`/api/features/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: payload.title?.trim(),
            description: payload.description?.trim(),
            icon: payload.icon,
            order: payload.order,
          }),
        });
        setFeatures((prev) =>
          sortFeaturesByOrder(
            prev.map((item) => (item._id === feature._id ? feature : item))
          )
        );
        setStatusMessage("Feature updated.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to update feature."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleDeleteFeature = useCallback(
    async (id: string) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Removing feature...");

      try {
        await request<{ success: boolean }>(`/api/features/${id}`, {
          method: "DELETE",
        });
        setFeatures((prev) => prev.filter((item) => item._id !== id));
        setStatusMessage("Feature removed.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to remove feature."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleSaveHero = useCallback(
    async (payload: {
      badge: string;
      headline: string;
      description: string;
      primaryCtaLabel: string;
      primaryCtaHref: string;
      secondaryCtaLabel: string;
      secondaryCtaHref: string;
    }) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Saving hero...");

      try {
        const updated = await request<HeroContent>("/api/hero", {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        setHeroContent(updated);
        setStatusMessage("Hero updated.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to update hero content."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );

  const handleSaveAbout = useCallback(
    async (payload: {
      heading: string;
      paragraphs: string[];
      resumeLabel: string;
      resumeUrl: string;
      secondaryLabel?: string;
      secondaryUrl?: string;
    }) => {
      setIsMutating(true);
      setErrorMessage(null);
      setStatusMessage("Saving about section...");

      try {
        const updated = await request<AboutContent>("/api/about", {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        setAboutContent(updated);
        setStatusMessage("About section updated.");
        scheduleStatusClear();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to update about section."
        );
      } finally {
        setIsMutating(false);
      }
    },
    [request, scheduleStatusClear]
  );


  const sortedSkills = useMemo(
    () => skills.slice().sort((a, b) => a.order - b.order),
    [skills]
  );

  const sortedProjects = useMemo(
    () => projects.slice().sort((a, b) => a.order - b.order),
    [projects]
  );

  const sortedExperience = useMemo(
    () =>
      experience
        .slice()
        .sort((a, b) => {
          if (a.isCurrent && !b.isCurrent) return -1;
          if (!a.isCurrent && b.isCurrent) return 1;
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }),
    [experience]
  );

  const sortedCertifications = useMemo(
    () =>
      certifications
        .slice()
        .sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }),
    [certifications]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-[color:var(--color-foreground)]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-[color:var(--color-muted)]">
              Manage skills, projects, certifications, experience entries, and view incoming messages.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-[color:var(--color-surface-border)] px-3 py-1 text-xs uppercase tracking-wide text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-full border border-[color:var(--color-surface-border)] px-3 py-1 text-xs uppercase tracking-wide text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
            >
              Refresh data
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              activeTab === tab.id
                ? "bg-[color:var(--color-accent)] text-white shadow-[0_18px_35px_-20px_var(--color-shadow)]"
                : "border border-[color:var(--color-surface-border)] text-[color:var(--color-foreground)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {statusMessage && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl border border-[color:var(--color-admin-danger)] bg-red-500/10 px-4 py-3 text-sm text-[color:var(--color-admin-danger-text)]">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="surface-card mt-8 rounded-3xl p-8">
        {loading ? (
          <div className="text-[color:var(--color-foreground-secondary)]">Loading data...</div>
        ) : (
          <div>
            {activeTab === "branding" && (
              <BrandingPanel
                key={`${siteIdentity._id}-${siteIdentity.updatedAt}`}
                site={siteIdentity}
                onSave={handleSaveSiteIdentity}
                onUploadLogo={(file) => uploadImageFile(file, "branding")}
                onError={(message) => setErrorMessage(message)}
                busy={isMutating}
              />
            )}
            {activeTab === "features" && (
              <FeaturesPanel
                key={features.map((feature) => `${feature._id}-${feature.updatedAt}`).join("|")}
                features={features}
                onCreate={handleCreateFeature}
                onUpdate={handleUpdateFeature}
                onDelete={handleDeleteFeature}
                busy={isMutating}
              />
            )}
            {activeTab === "hero" && (
              <HeroPanel
                key={`${(heroContent ?? HERO_CONTENT_FALLBACK)._id}-${(heroContent ?? HERO_CONTENT_FALLBACK).updatedAt}`}
                content={heroContent ?? HERO_CONTENT_FALLBACK}
                onSave={handleSaveHero}
                busy={isMutating}
              />
            )}
            {activeTab === "about" && (
              <AboutPanel
                key={`${(aboutContent ?? ABOUT_CONTENT_FALLBACK)._id}-${(aboutContent ?? ABOUT_CONTENT_FALLBACK).updatedAt}`}
                content={aboutContent ?? ABOUT_CONTENT_FALLBACK}
                onSave={handleSaveAbout}
                busy={isMutating}
              />
            )}
            {activeTab === "skills" && (
              <SkillsPanel
                key="skills"
                skills={sortedSkills}
                levels={skillLevels}
                onCreate={handleCreateSkill}
                onDelete={handleDeleteSkill}
                busy={isMutating}
              />
            )}
            {activeTab === "projects" && (
              <ProjectsPanel
                key="projects"
                projects={sortedProjects}
                onCreate={handleCreateProject}
                onDelete={handleDeleteProject}
                busy={isMutating}
              />
            )}
            {activeTab === "experience" && (
              <ExperiencePanel
                key="experience"
                experience={sortedExperience}
                onCreate={handleCreateExperience}
                onDelete={handleDeleteExperience}
                busy={isMutating}
              />
            )}
            {activeTab === "certifications" && (
              <CertificationsPanel
                key="certifications"
                certifications={sortedCertifications}
                onCreate={handleCreateCertification}
                onDelete={handleDeleteCertification}
                busy={isMutating}
              />
            )}
            {activeTab === "messages" && (
              <MessagesPanel
                key="messages"
                messages={messages}
                onUpdateStatus={handleUpdateMessageStatus}
                onDelete={handleDeleteMessage}
                busy={isMutating}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type HeroPanelProps = {
  content: HeroContent;
  onSave: (payload: {
    badge: string;
    headline: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  }) => Promise<void> | void;
  busy: boolean;
};

function HeroPanel({ content, onSave, busy }: HeroPanelProps) {
  type HeroFormState = {
    badge: string;
    headline: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };

  const initialForm: HeroFormState = {
    badge: content.badge,
    headline: content.headline,
    description: content.description,
    primaryLabel: content.primaryCtaLabel,
    primaryHref: content.primaryCtaHref,
    secondaryLabel: content.secondaryCtaLabel,
    secondaryHref: content.secondaryCtaHref,
  };

  const [form, setForm] = useState<HeroFormState>(initialForm);

  const inputClasses =
    "mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = {
      badge: form.badge.trim() || HERO_CONTENT_FALLBACK.badge,
      headline: form.headline.trim() || HERO_CONTENT_FALLBACK.headline,
      description: form.description.trim() || HERO_CONTENT_FALLBACK.description,
      primaryCtaLabel: form.primaryLabel.trim() || HERO_CONTENT_FALLBACK.primaryCtaLabel,
      primaryCtaHref: form.primaryHref.trim() || HERO_CONTENT_FALLBACK.primaryCtaHref,
      secondaryCtaLabel: form.secondaryLabel.trim() || HERO_CONTENT_FALLBACK.secondaryCtaLabel,
      secondaryCtaHref: form.secondaryHref.trim() || HERO_CONTENT_FALLBACK.secondaryCtaHref,
    };

    await onSave(trimmed);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Badge</span>
          <input
            value={form.badge}
            onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))}
            className={inputClasses}
            placeholder="Full-Stack Developer"
            disabled={busy}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Primary CTA label</span>
          <input
            value={form.primaryLabel}
            onChange={(event) => setForm((prev) => ({ ...prev, primaryLabel: event.target.value }))}
            className={inputClasses}
            placeholder="View Projects"
            disabled={busy}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Primary CTA link</span>
          <input
            value={form.primaryHref}
            onChange={(event) => setForm((prev) => ({ ...prev, primaryHref: event.target.value }))}
            className={inputClasses}
            placeholder="#projects"
            disabled={busy}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Secondary CTA label</span>
          <input
            value={form.secondaryLabel}
            onChange={(event) => setForm((prev) => ({ ...prev, secondaryLabel: event.target.value }))}
            className={inputClasses}
            placeholder="LinkedIn"
            disabled={busy}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Secondary CTA link</span>
          <input
            value={form.secondaryHref}
            onChange={(event) => setForm((prev) => ({ ...prev, secondaryHref: event.target.value }))}
            className={inputClasses}
            placeholder="https://www.linkedin.com/in/abdullah-mern/"
            disabled={busy}
          />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Headline</span>
        <textarea
          value={form.headline}
          onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))}
          className={`${inputClasses} min-h-[5.5rem]`}
          disabled={busy}
        />
      </label>

      <label className="flex flex-col">
        <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Description</span>
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          className={`${inputClasses} min-h-[6.5rem]`}
          disabled={busy}
        />
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-[color:var(--color-accent)] px-6 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_-20px_var(--color-shadow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Saving..." : "Save hero"}
        </button>
      </div>
    </form>
  );
}

type AboutPanelProps = {
  content: AboutContent;
  onSave: (payload: {
    heading: string;
    paragraphs: string[];
    resumeLabel: string;
    resumeUrl: string;
    secondaryLabel?: string;
    secondaryUrl?: string;
  }) => Promise<void> | void;
  busy: boolean;
};

function AboutPanel({ content, onSave, busy }: AboutPanelProps) {
  type AboutFormState = {
    heading: string;
    paragraphsText: string;
    resumeLabel: string;
    resumeUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
  };

  const initialForm: AboutFormState = {
    heading: content.heading,
    paragraphsText: content.paragraphs?.join("\n\n") ?? "",
    resumeLabel: content.resumeLabel,
    resumeUrl: content.resumeUrl,
    secondaryLabel: content.secondaryLabel ?? "",
    secondaryUrl: content.secondaryUrl ?? "",
  };

  const [form, setForm] = useState<AboutFormState>(initialForm);

  const inputClasses =
    "mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const paragraphs = form.paragraphsText
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length);

    await onSave({
      heading: form.heading.trim() || ABOUT_CONTENT_FALLBACK.heading,
      paragraphs: paragraphs.length ? paragraphs : ABOUT_CONTENT_FALLBACK.paragraphs,
      resumeLabel: form.resumeLabel.trim() || ABOUT_CONTENT_FALLBACK.resumeLabel,
      resumeUrl: form.resumeUrl.trim() || ABOUT_CONTENT_FALLBACK.resumeUrl,
      secondaryLabel: form.secondaryLabel.trim() || undefined,
      secondaryUrl: form.secondaryUrl.trim() || undefined,
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <label className="flex flex-col">
        <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Heading</span>
        <input
          value={form.heading}
          onChange={(event) => setForm((prev) => ({ ...prev, heading: event.target.value }))}
          className={inputClasses}
          placeholder="About"
          disabled={busy}
        />
      </label>

      <label className="flex flex-col">
        <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Paragraphs</span>
        <textarea
          value={form.paragraphsText}
          onChange={(event) => setForm((prev) => ({ ...prev, paragraphsText: event.target.value }))}
          className={`${inputClasses} min-h-[10rem]`}
          placeholder="Use blank lines to separate paragraphs"
          disabled={busy}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Resume button label</span>
          <input
            value={form.resumeLabel}
            onChange={(event) => setForm((prev) => ({ ...prev, resumeLabel: event.target.value }))}
            className={inputClasses}
            placeholder="Download CV"
            disabled={busy}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Resume link</span>
          <input
            value={form.resumeUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, resumeUrl: event.target.value }))}
            className={inputClasses}
            placeholder="/resume.pdf"
            disabled={busy}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Secondary label</span>
          <input
            value={form.secondaryLabel}
            onChange={(event) => setForm((prev) => ({ ...prev, secondaryLabel: event.target.value }))}
            className={inputClasses}
            placeholder="Schedule a call ->"
            disabled={busy}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">Secondary link</span>
          <input
            value={form.secondaryUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, secondaryUrl: event.target.value }))}
            className={inputClasses}
            placeholder="https://cal.com/"
            disabled={busy}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-[color:var(--color-accent)] px-6 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_-20px_var(--color-shadow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Saving..." : "Save about"}
        </button>
      </div>
    </form>
  );
}
type SkillsPanelProps = {
  skills: Skill[];
  levels: Skill["level"][];
  onCreate: (payload: {
    name: string;
    category: string;
    level: Skill["level"];
    iconUrl?: string;
    order?: number;
  }) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  busy: boolean;
};

function SkillsPanel({ skills, levels, onCreate, onDelete, busy }: SkillsPanelProps) {
  type SkillFormState = {
    name: string;
    category: string;
    level: Skill["level"];
    iconUrl: string;
    order: string;
  };

  const initialForm: SkillFormState = {
    name: "",
    category: "",
    level: "Intermediate",
    iconUrl: "",
    order: "0",
  };

  const [form, setForm] = useState<SkillFormState>(initialForm);
  const inputClasses =
    "mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onCreate({
      name: form.name.trim(),
      category: form.category.trim(),
      level: form.level,
      iconUrl: form.iconUrl ? form.iconUrl.trim() : undefined,
      order: Number(form.order) || 0,
    });
    setForm(initialForm);
  };

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">Add Skill</h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            New skills appear immediately on the public site.
          </p>
        </div>
        <div className="grid gap-3">
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className={inputClasses}
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Category
            <input
              required
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
              className={inputClasses}
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Level
            <select
              value={form.level}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  level: event.target.value as Skill["level"],
                }))
              }
              className={inputClasses}
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Icon URL (optional)
            <input
              value={form.iconUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, iconUrl: event.target.value }))
              }
              placeholder="https://..."
              className={inputClasses}
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Order
            <input
              type="number"
              value={form.order}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, order: event.target.value }))
              }
              className={inputClasses}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : "Add Skill"}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">Existing Skills</h3>
          <span className="text-xs text-[color:var(--color-muted)]">{skills.length} total</span>
        </div>
        {skills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[color:var(--color-admin-border-soft)] px-4 py-6 text-center text-[color:var(--color-muted)]">
            No skills have been added yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {skills.map((skill) => (
              <li
                key={skill._id}
                className="surface-card flex items-center justify-between rounded-xl px-4 py-3"
              >
                <div>
                    <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                      {skill.name}{" "}
                      <span className="text-xs text-[color:var(--color-muted)]">({skill.category})</span>
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      Level: {skill.level} | Order: {skill.order}
                    </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[color:var(--color-admin-danger)] px-3 py-1 text-xs font-semibold text-[color:var(--color-admin-danger-text)] transition hover:bg-red-500/20"
                  onClick={() => onDelete(skill._id)}
                  disabled={busy}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type ProjectsPanelProps = {
  projects: Project[];
  onCreate: (payload: {
    title: string;
    description: string;
    techStack: string[];
    gallery: string[];
    liveUrl?: string;
    repoUrl?: string;
    featured: boolean;
    order?: number;
  }) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  busy: boolean;
};

function ProjectsPanel({ projects, onCreate, onDelete, busy }: ProjectsPanelProps) {
  type ProjectFormState = {
    title: string;
    description: string;
    techStack: string;
    gallery: string[];
    newGalleryUrl: string;
    liveUrl: string;
    repoUrl: string;
    featured: boolean;
    order: string;
  };

  const initialForm: ProjectFormState = {
    title: "",
    description: "",
    techStack: "",
    gallery: [],
    newGalleryUrl: "",
    liveUrl: "",
    repoUrl: "",
    featured: false,
    order: "0",
  };

  const [form, setForm] = useState<ProjectFormState>(initialForm);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const inputClasses =
    "mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]";
  const textAreaClasses =
    "mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]";

  const handleAddGalleryUrl = () => {
    const trimmed = form.newGalleryUrl.trim();
    if (!trimmed) {
      return;
    }
    setFormError(null);
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.includes(trimmed)
        ? prev.gallery
        : [...prev.gallery, trimmed],
      newGalleryUrl: "",
    }));
  };

  const handleRemoveGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || !files.length) {
      return;
    }
    setUploading(true);
    setFormError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImageFile(file, "portfolio/projects");
        uploaded.push(url);
      }
      setForm((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...uploaded],
      }));
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const manualUrl = form.newGalleryUrl.trim();
    const combined = manualUrl
      ? [...form.gallery, manualUrl]
      : form.gallery.slice();

    const uniqueGallery = combined.filter((url, index) =>
      combined.indexOf(url) === index
    );

    if (!uniqueGallery.length) {
      setFormError("Add at least one project image.");
      return;
    }

    await onCreate({
      title: form.title.trim(),
      description: form.description.trim(),
      techStack: form.techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      gallery: uniqueGallery,
      liveUrl: form.liveUrl ? form.liveUrl.trim() : undefined,
      repoUrl: form.repoUrl ? form.repoUrl.trim() : undefined,
      featured: form.featured,
      order: Number(form.order) || 0,
    });

    setForm(initialForm);
    setFormError(null);
  };

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">Add Project</h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Showcase new work including multiple gallery images.
          </p>
        </div>
        <div className="grid gap-3">
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Title
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              className={inputClasses}
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Description
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className={textAreaClasses}
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Tech stack (comma separated)
            <input
              value={form.techStack}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, techStack: event.target.value }))
              }
              placeholder="Next.js, TypeScript, Tailwind"
              className={inputClasses}
            />
          </label>
          <div className="space-y-2 text-sm text-[color:var(--color-foreground-secondary)]">
            <span>Gallery images</span>
            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={form.newGalleryUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      newGalleryUrl: event.target.value,
                    }))
                  }
                  placeholder="https://res.cloudinary.com/..."
                  className="flex-1 rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="rounded-full border border-[color:var(--color-accent)] px-3 py-2 text-xs font-semibold text-[color:var(--color-accent)] transition hover:bg-[color:var(--color-accent)] hover:text-white"
                  disabled={!form.newGalleryUrl.trim()}
                >
                  Add URL
                </button>
              </div>
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--color-surface-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]">
                <span>{uploading ? "Uploading..." : "Upload images"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => handleGalleryUpload(event.target.files)}
                />
              </label>
              {form.gallery.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {form.gallery.map((image, index) => (
                    <li key={`${image}-${index}`} className="group relative">
                      <Image src={image} alt={`Project image ${index + 1}`} width={64} height={64} className="h-16 w-16 rounded-lg border border-[color:var(--color-surface-border)] object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-xs font-bold text-white group-hover:flex"
                        aria-label="Remove image"
                      >
                        ?
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {formError && (
                <p className="text-xs text-red-300">{formError}</p>
              )}
            </div>
          </div>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Live URL (optional)
            <input
              value={form.liveUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, liveUrl: event.target.value }))
              }
              placeholder="https://example.com"
              className={inputClasses}
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Repository URL (optional)
            <input
              value={form.repoUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, repoUrl: event.target.value }))
              }
              placeholder="https://github.com/..."
              className={inputClasses}
            />
          </label>
          <div className="flex items-center justify-between text-sm text-[color:var(--color-foreground-secondary)]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    featured: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] text-[color:var(--color-accent)] focus:ring-[color:var(--color-accent)]"
              />
              Featured project
            </label>
            <label className="text-sm text-[color:var(--color-foreground-secondary)]">
              Order
              <input
                type="number"
                value={form.order}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, order: event.target.value }))
                }
                className="ml-2 w-24 rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-1 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
              />
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy || uploading}
          className="w-full rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_-20px_var(--color-shadow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : "Add Project"}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">Project Catalog</h3>
          <span className="text-xs text-[color:var(--color-muted)]">{projects.length} total</span>
        </div>
        {projects.length === 0 ? (
          <div className="surface-card rounded-xl border-dashed px-4 py-6 text-center text-[color:var(--color-muted)]">
            No projects recorded yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li
                key={project._id}
                className="surface-card rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                      {project.title}
                      {project.featured && (
                        <span className="ml-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-500">
                          Featured
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      Order: {project.order} ? Gallery: {project.gallery.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-[color:var(--color-admin-danger)] px-3 py-1 text-xs font-semibold text-[color:var(--color-admin-danger-text)] transition hover:bg-red-500/20"
                    onClick={() => onDelete(project._id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-3 text-sm text-[color:var(--color-muted)] line-clamp-3">
                  {project.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type CertificationsPanelProps = {
  certifications: Certification[];
  onCreate: (payload: {
    title: string;
    issuer?: string;
    description?: string;
    imageUrl: string;
    credentialUrl?: string;
    startDate: string;
    endDate?: string | null;
    order?: number;
  }) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  busy: boolean;
};

function CertificationsPanel({
  certifications,
  onCreate,
  onDelete,
  busy,
}: CertificationsPanelProps) {
  type CertificationFormState = {
    title: string;
    issuer: string;
    description: string;
    imageUrl: string;
    credentialUrl: string;
    startDate: string;
    endDate: string;
    order: string;
  };

  const initialForm: CertificationFormState = {
    title: "",
    issuer: "",
    description: "",
    imageUrl: "",
    credentialUrl: "",
    startDate: "",
    endDate: "",
    order: "0",
  };

  const [form, setForm] = useState<CertificationFormState>(initialForm);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const inputClasses =
    "mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]";
  const textAreaClasses =
    "mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]";

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !files.length) {
      return;
    }
    setUploading(true);
    setFormError(null);
    try {
      const url = await uploadImageFile(files[0], "portfolio/certifications");
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.imageUrl) {
      setFormError("Upload or provide an image for the certification.");
      return;
    }

    await onCreate({
      title: form.title.trim(),
      issuer: form.issuer ? form.issuer.trim() : undefined,
      description: form.description ? form.description.trim() : undefined,
      imageUrl: form.imageUrl,
      credentialUrl: form.credentialUrl ? form.credentialUrl.trim() : undefined,
      startDate: form.startDate,
      endDate: form.endDate ? form.endDate : null,
      order: Number(form.order) || 0,
    });

    setForm(initialForm);
    setFormError(null);
  };

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">Add Certification</h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Highlight credentials with dates and imagery.
          </p>
        </div>
        <div className="grid gap-3">
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Title
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              className={inputClasses}
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Issuer
            <input
              value={form.issuer}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, issuer: event.target.value }))
              }
              className={inputClasses}
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className={textAreaClasses}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-[color:var(--color-foreground-secondary)]">
              Start date
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, startDate: event.target.value }))
                }
                className={inputClasses}
              />
            </label>
            <label className="text-sm text-[color:var(--color-foreground-secondary)]">
              End date
              <input
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endDate: event.target.value }))
                }
                className={inputClasses}
              />
            </label>
          </div>
          <div className="space-y-2 text-sm text-[color:var(--color-foreground-secondary)]">
            <span>Certification image</span>
            <div className="space-y-2">
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--color-surface-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]">
                <span>{uploading ? "Uploading..." : "Upload image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleImageUpload(event.target.files)}
                />
              </label>
              <input
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                }
                placeholder="https://res.cloudinary.com/..."
                className={inputClasses}
              />
              {form.imageUrl && (
                <div className="flex items-center gap-3">
                  <Image src={form.imageUrl} alt="Certification preview" width={64} height={64} className="h-16 w-16 rounded-lg border border-[color:var(--color-surface-border)] object-cover" />
                  <button
                    type="button"
                    className="rounded-full border border-[color:var(--color-admin-danger)] px-3 py-1 text-xs font-semibold text-[color:var(--color-admin-danger-text)] transition hover:bg-red-500/20"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                  >
                    Remove
                  </button>
                </div>
              )}
              {formError && (
                <p className="text-xs text-red-300">{formError}</p>
              )}
            </div>
          </div>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Credential URL (optional)
            <input
              value={form.credentialUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, credentialUrl: event.target.value }))
              }
              placeholder="https://example.com/certificate"
              className={inputClasses}
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Order
            <input
              type="number"
              value={form.order}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, order: event.target.value }))
              }
              className="mt-1 w-24 rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy || uploading}
          className="w-full rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_-20px_var(--color-shadow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : "Add Certification"}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">Certification Library</h3>
          <span className="text-xs text-[color:var(--color-muted)]">{certifications.length} total</span>
        </div>
        {certifications.length === 0 ? (
          <div className="surface-card rounded-xl border-dashed px-4 py-6 text-center text-[color:var(--color-muted)]">
            No certifications recorded yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {certifications.map((cert) => (
              <li
                key={cert._id}
                className="surface-card grid gap-3 rounded-xl p-4 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <Image src={cert.imageUrl} alt={cert.title} width={64} height={64} className="h-16 w-16 rounded-lg border border-[color:var(--color-surface-border)] object-cover" />
                <div>
                  <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                    {cert.title}
                  </p>
                  <p className="text-xs text-[color:var(--color-muted)]">
                    {cert.issuer ? `${cert.issuer} ? ` : ""}
                    {formatCertificationRange(cert.startDate, cert.endDate)}
                  </p>
                </div>
                <button
                  type="button"
                  className="justify-self-end rounded-full border border-[color:var(--color-admin-danger)] px-3 py-1 text-xs font-semibold text-[color:var(--color-admin-danger-text)] transition hover:bg-red-500/20"
                  onClick={() => onDelete(cert._id)}
                  disabled={busy}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
type ExperiencePanelProps = {
  experience: Experience[];
  onCreate: (payload: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
    achievements: string[];
    techStack: string[];
  }) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  busy: boolean;
};

function ExperiencePanel({ experience, onCreate, onDelete, busy }: ExperiencePanelProps) {
  type ExperienceFormState = {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    achievements: string;
    techStack: string;
  };

  const initialForm: ExperienceFormState = {
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    achievements: "",
    techStack: "",
  };

  const [form, setForm] = useState<ExperienceFormState>(initialForm);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onCreate({
      company: form.company.trim(),
      role: form.role.trim(),
      startDate: form.startDate,
      endDate: form.isCurrent ? null : form.endDate || null,
      isCurrent: form.isCurrent,
      achievements: form.achievements
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      techStack: form.techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setForm(initialForm);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">Add Experience</h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Track roles, achievements, and technologies used.
          </p>
        </div>
        <div className="grid gap-3">
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Company
            <input
              required
              value={form.company}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, company: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Role
            <input
              required
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, role: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-[color:var(--color-foreground-secondary)]">
              Start Date
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, startDate: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
              />
            </label>
            <label className="text-sm text-[color:var(--color-foreground-secondary)]">
              End Date
              <input
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endDate: event.target.value }))
                }
                disabled={form.isCurrent}
                className="mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)] disabled:opacity-40"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-[color:var(--color-foreground-secondary)]">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isCurrent: event.target.checked }))
              }
              className="h-4 w-4 rounded border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] text-[color:var(--color-accent)] focus:ring-[color:var(--color-accent)]"
            />
            Current Position
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Achievements (one per line)
            <textarea
              rows={4}
              value={form.achievements}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  achievements: event.target.value,
                }))
              }
              placeholder={"Increased conversion by 20%\nMentored junior engineers"}
              className="mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
            />
          </label>
          <label className="text-sm text-[color:var(--color-foreground-secondary)]">
            Tech Stack (comma separated)
            <input
              value={form.techStack}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, techStack: event.target.value }))
              }
              placeholder="Next.js, GraphQL, AWS"
              className="mt-1 w-full rounded-lg border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : "Add Experience"}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">Timeline</h3>
          <span className="text-xs text-[color:var(--color-muted)]">{experience.length} records</span>
        </div>
        {experience.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[color:var(--color-admin-border-soft)] px-4 py-6 text-center text-[color:var(--color-muted)]">
            No experience records yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {experience.map((record) => (
              <li
                key={record._id}
                className="rounded-xl border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface)] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-foreground-secondary)]">
                      {record.role} | {record.company}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      {formatDate(record.startDate)} ??? {record.isCurrent ? "Present" : formatDate(record.endDate)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-[color:var(--color-admin-danger)] px-3 py-1 text-xs font-semibold text-[color:var(--color-admin-danger-text)] transition hover:bg-red-500/20"
                    onClick={() => onDelete(record._id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
                <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-[color:var(--color-foreground-secondary)]">
                  {record.achievements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type MessagesPanelProps = {
  messages: ContactMessage[];
  onUpdateStatus: (id: string, status: "new" | "read") => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  busy: boolean;
};

function MessagesPanel({ messages, onUpdateStatus, onDelete, busy }: MessagesPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">Inbox</h2>
        <span className="text-xs text-[color:var(--color-muted)]">{messages.length} messages</span>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--color-admin-border-soft)] px-4 py-6 text-center text-[color:var(--color-muted)]">
          No contact messages yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => {
            const contactParts: string[] = [];
            if (message.email) {
              contactParts.push(message.email);
            }
            if (message.phone) {
              contactParts.push(message.phone);
            }
            const contactDetails = contactParts.join(" | ");
            const channelLabel =
              message.channel === "whatsapp" ? "WhatsApp" : "Contact form";

            return (
              <li
                key={message._id}
                className="rounded-2xl border border-[color:var(--color-admin-border)] bg-[color:var(--color-admin-surface)] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-foreground-secondary)]">
                      {message.name}
                      {contactDetails && (
                        <span className="text-[color:var(--color-muted)]"> | {contactDetails}</span>
                      )}
                    </p>
                    <p className="text-xs text-[color:var(--color-foreground)]">
                      {formatTimestamp(message.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[color:var(--color-admin-chip)] px-3 py-1 text-xs font-semibold text-[color:var(--color-admin-chip-text)]">
                      {channelLabel}
                    </span>
                    <span
                      className={clsx(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        message.status === "read"
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-[color:var(--color-accent)]/15 text-[color:var(--color-foreground)]"
                      )}
                    >
                      {message.status === "read" ? "Read" : "New"}
                    </span>
                    {message.status === "new" ? (
                      <button
                        type="button"
                        className="rounded-full border border-[color:var(--color-admin-border)] px-3 py-1 text-xs text-[color:var(--color-foreground-secondary)] transition hover:border-emerald-400 hover:text-emerald-500"
                        onClick={() => onUpdateStatus(message._id, "read")}
                        disabled={busy}
                      >
                        Mark as read
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-full border border-[color:var(--color-admin-border)] px-3 py-1 text-xs text-[color:var(--color-foreground-secondary)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                        onClick={() => onUpdateStatus(message._id, "new")}
                        disabled={busy}
                      >
                        Mark unread
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-full border border-[color:var(--color-admin-danger)] px-3 py-1 text-xs text-[color:var(--color-admin-danger-text)] transition hover:bg-red-500/20"
                      onClick={() => onDelete(message._id)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-[color:var(--color-foreground-secondary)]">
                  {message.message}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const message = record.message ?? record.error;
    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

function extractData<T>(payload: unknown): T {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if ("data" in record) {
      return record.data as T;
    }
  }

  return payload as T;
}

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function formatCertificationRange(start: string, end?: string | null) {
  if (!start) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  });

  const startDate = new Date(start);
  const startLabel = Number.isNaN(startDate.getTime())
    ? start
    : formatter.format(startDate);

  if (!end) {
    return `${startLabel} - Present`;
  }

  const endDate = new Date(end);
  const endLabel = Number.isNaN(endDate.getTime())
    ? end
    : formatter.format(endDate);

  return `${startLabel} - ${endLabel}`;
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}




























