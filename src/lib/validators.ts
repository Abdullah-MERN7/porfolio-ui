import { z } from "zod";

export const skillPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).default(
    "Intermediate"
  ),
  iconUrl: z.string().optional(),
  order: z.number().int().optional(),
});

export const projectPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  techStack: z.array(z.string()).default([]),
  gallery: z
    .array(z.string().min(1, "Image URL must be valid"))
    .min(1, "Provide at least one image"),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().optional(),
});

export const experiencePayloadSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  isCurrent: z.boolean().default(false),
  achievements: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
});

export const contactPayloadSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional(),
    phone: z
      .string()
      .min(5, "Phone number should include at least 5 characters")
      .optional(),
    message: z.string().min(10, "Message should be at least 10 characters"),
    channel: z
      .enum(["contact-form", "whatsapp"])
      .default("contact-form"),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide an email address or phone number",
        path: ["email"],
      });
    }
  });

export const certificationPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  issuer: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
  credentialUrl: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  order: z.number().int().optional(),
});

export const featurePayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Select an icon"),
  order: z.number().int().optional(),
});

export const siteIdentityPayloadSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  brandTagline: z.string().optional(),
  brandDescription: z.string().optional(),
  brandLogoUrl: z
    .string()
    .min(1, "Logo URL is required")
    .optional()
    .nullable(),
});
export const heroPaletteSchema = z.object({
  primary: z.string().min(1, "Primary color is required"),
  secondary: z.string().min(1, "Secondary color is required"),
  accent: z.string().min(1, "Accent color is required"),
  particles: z.string().min(1, "Particle color is required"),
});

export const heroContentPayloadSchema = z.object({
  badge: z.string().min(1, "Badge is required"),
  headline: z.string().min(1, "Headline is required"),
  description: z.string().min(1, "Description is required"),
  primaryCtaLabel: z.string().min(1, "Primary CTA label is required"),
  primaryCtaHref: z.string().min(1, "Primary CTA link is required"),
  secondaryCtaLabel: z.string().min(1, "Secondary CTA label is required"),
  secondaryCtaHref: z.string().min(1, "Secondary CTA link is required"),
  linkedinHref: z.string().optional(),
  palette: heroPaletteSchema.optional(),
});

export const aboutContentPayloadSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  paragraphs: z.array(z.string().min(1, "Paragraph cannot be empty")).min(1),
  resumeLabel: z.string().min(1, "Resume button label is required"),
  resumeUrl: z.string().min(1, "Resume link is required"),
  secondaryLabel: z.string().optional(),
  secondaryUrl: z.string().optional(),
});
export const whatsappNotificationSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().min(5, "Message should be at least 5 characters"),
});

export const uploadPayloadSchema = z.object({
  file: z.string().min(1, "File data is required"),
  folder: z.string().optional(),
});

export type SkillPayload = z.infer<typeof skillPayloadSchema>;
export type ProjectPayload = z.infer<typeof projectPayloadSchema>;
export type ExperiencePayload = z.infer<typeof experiencePayloadSchema>;
export type ContactPayload = z.infer<typeof contactPayloadSchema>;
export type CertificationPayload = z.infer<typeof certificationPayloadSchema>;
export type WhatsappNotificationPayload = z.infer<
  typeof whatsappNotificationSchema
>;
export type UploadPayload = z.infer<typeof uploadPayloadSchema>;

export type HeroPalettePayload = z.infer<typeof heroPaletteSchema>;
export type HeroContentPayload = z.infer<typeof heroContentPayloadSchema>;
export type AboutContentPayload = z.infer<typeof aboutContentPayloadSchema>;
export type FeaturePayload = z.infer<typeof featurePayloadSchema>;
export type SiteIdentityPayload = z.infer<typeof siteIdentityPayloadSchema>;
