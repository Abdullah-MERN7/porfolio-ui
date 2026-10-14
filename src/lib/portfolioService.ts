import { Types } from "mongoose";

import {
  CertificationModel,
  ContactMessageModel,
  ExperienceModel,
  ProjectModel,
  SkillModel,
  HeroContentModel,
  AboutContentModel,
  FeatureModel,
  SiteIdentityModel,
} from "@/src/models";

import { ABOUT_CONTENT_SEED, FEATURE_SEED, HERO_CONTENT_SEED, SITE_IDENTITY_SEED } from "./defaultContent";
import { dbConnect } from "./dbConnect";
import {
  certificationPayloadSchema,
  contactPayloadSchema,
  experiencePayloadSchema,
  projectPayloadSchema,
  skillPayloadSchema,
  heroContentPayloadSchema,
  aboutContentPayloadSchema,
  featurePayloadSchema,
  siteIdentityPayloadSchema,
  type CertificationPayload,
  type ContactPayload,
  type ExperiencePayload,
  type FeaturePayload,
  type ProjectPayload,
  type SkillPayload,
} from "./validators";
import {
  serializeCertification,
  serializeContactMessage,
  serializeExperience,
  serializeProject,
  serializeSkill,
  serializeHeroContent,
  serializeAboutContent,
  serializeFeature,
  serializeSiteIdentity,
} from "./serializers";
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
type ContactMessageStatus = "new" | "read";

function isValidObjectId(id: unknown): id is string {
  return typeof id === "string" && Types.ObjectId.isValid(id);
}

function stripUndefined<T extends object>(value: T): T {
  const entries = Object.entries(value as Record<string, unknown>).filter(([, val]) => val !== undefined);
  return Object.fromEntries(entries) as T;
}


export async function getSiteIdentity(): Promise<SiteIdentity> {
  await dbConnect();
  let doc = await SiteIdentityModel.findOne().exec();

  if (!doc) {
    doc = await SiteIdentityModel.create({
      brandName: SITE_IDENTITY_SEED.brandName,
      brandTagline: SITE_IDENTITY_SEED.brandTagline,
      brandDescription: SITE_IDENTITY_SEED.brandDescription,
      brandLogoUrl: SITE_IDENTITY_SEED.brandLogoUrl,
    });
  }

  return serializeSiteIdentity(doc);
}

export async function updateSiteIdentity(payload: unknown): Promise<SiteIdentity> {
  const parsed = siteIdentityPayloadSchema.partial().parse(payload);

  await dbConnect();
  let doc = await SiteIdentityModel.findOne().exec();

  if (!doc) {
    doc = await SiteIdentityModel.create({
      brandName: SITE_IDENTITY_SEED.brandName,
      brandTagline: SITE_IDENTITY_SEED.brandTagline,
      brandDescription: SITE_IDENTITY_SEED.brandDescription,
      brandLogoUrl: SITE_IDENTITY_SEED.brandLogoUrl,
    });
  }

  const setDoc: Record<string, unknown> = {};
  const unsetDoc: Record<string, 1> = {};

  if (parsed.brandName !== undefined) {
    setDoc.brandName = parsed.brandName.trim();
  }

  if (parsed.brandTagline !== undefined) {
    const value = parsed.brandTagline.trim();
    if (value) {
      setDoc.brandTagline = value;
    } else {
      unsetDoc.brandTagline = 1;
    }
  }

  if (parsed.brandDescription !== undefined) {
    const value = parsed.brandDescription.trim();
    if (value) {
      setDoc.brandDescription = value;
    } else {
      unsetDoc.brandDescription = 1;
    }
  }

  if (parsed.brandLogoUrl !== undefined) {
    const value = parsed.brandLogoUrl;
    if (typeof value === "string" && value.trim()) {
      setDoc.brandLogoUrl = value.trim();
    } else {
      unsetDoc.brandLogoUrl = 1;
    }
  }

  if (!Object.keys(setDoc).length && !Object.keys(unsetDoc).length) {
    return serializeSiteIdentity(doc);
  }

  const updateOps: {
    $set?: Record<string, unknown>;
    $unset?: Record<string, 1>;
  } = {};

  if (Object.keys(setDoc).length) {
    updateOps.$set = setDoc;
  }

  if (Object.keys(unsetDoc).length) {
    updateOps.$unset = unsetDoc;
  }

  const updated = await SiteIdentityModel.findByIdAndUpdate(doc._id, updateOps, {
    new: true,
  }).exec();

  return serializeSiteIdentity(updated ?? doc);
}

export async function getFeatures(): Promise<Feature[]> {
  await dbConnect();
  let docs = await FeatureModel.find()
    .sort({ order: 1, createdAt: -1 })
    .exec();

  if (!docs.length && FEATURE_SEED.length) {
    await FeatureModel.insertMany(
      FEATURE_SEED.map((feature, index) => ({
        title: feature.title.trim(),
        description: feature.description.trim(),
        icon: feature.icon.trim(),
        order: feature.order ?? index,
      }))
    );

    docs = await FeatureModel.find()
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  return docs.map(serializeFeature);
}

export async function getFeatureById(id: string): Promise<Feature | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await dbConnect();
  const doc = await FeatureModel.findById(id).exec();
  return doc ? serializeFeature(doc) : null;
}

export async function createFeature(payload: unknown): Promise<Feature> {
  const parsed: FeaturePayload = featurePayloadSchema.parse(payload);

  await dbConnect();
  const nextOrder =
    parsed.order ?? (await FeatureModel.countDocuments().exec());

  const doc = await FeatureModel.create({
    title: parsed.title.trim(),
    description: parsed.description.trim(),
    icon: parsed.icon.trim(),
    order: nextOrder,
  });

  return serializeFeature(doc);
}

export async function updateFeature(
  id: string,
  payload: unknown
): Promise<Feature | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  const parsed = featurePayloadSchema.partial().parse(payload);

  const update: Partial<FeaturePayload> = {};
  if (parsed.title !== undefined) {
    update.title = parsed.title.trim();
  }
  if (parsed.description !== undefined) {
    update.description = parsed.description.trim();
  }
  if (parsed.icon !== undefined) {
    update.icon = parsed.icon.trim();
  }
  if (parsed.order !== undefined) {
    update.order = parsed.order;
  }

  const data = stripUndefined(update);
  if (!Object.keys(data).length) {
    return await getFeatureById(id);
  }

  await dbConnect();
  const doc = await FeatureModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  ).exec();

  return doc ? serializeFeature(doc) : null;
}

export async function deleteFeature(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) {
    return false;
  }

  await dbConnect();
  const result = await FeatureModel.findByIdAndDelete(id).exec();
  return Boolean(result);
}export async function getSkills(): Promise<Skill[]> {
  await dbConnect();
  const docs = await SkillModel.find()
    .sort({ order: 1, createdAt: -1 })
    .exec();

  return docs.map(serializeSkill);
}
export async function getSkillById(id: string): Promise<Skill | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await dbConnect();
  const doc = await SkillModel.findById(id).exec();
  return doc ? serializeSkill(doc) : null;
}

export async function createSkill(payload: unknown): Promise<Skill> {
  const parsed: SkillPayload = skillPayloadSchema.parse(payload);

  await dbConnect();
  const doc = await SkillModel.create(parsed);
  return serializeSkill(doc);
}

export async function updateSkill(
  id: string,
  payload: unknown
): Promise<Skill | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  const parsed = skillPayloadSchema.partial().parse(payload);
  const update: Partial<SkillPayload> = stripUndefined(parsed);

  await dbConnect();

  if (!Object.keys(update).length) {
    const doc = await SkillModel.findById(id).exec();
    return doc ? serializeSkill(doc) : null;
  }

  const doc = await SkillModel.findByIdAndUpdate(id, update, {
    new: true,
  }).exec();

  return doc ? serializeSkill(doc) : null;
}

export async function deleteSkill(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) {
    return false;
  }

  await dbConnect();
  const result = await SkillModel.findByIdAndDelete(id).exec();
  return Boolean(result);
}

// Projects
export async function getProjects(): Promise<Project[]> {
  await dbConnect();
  const docs = await ProjectModel.find()
    .sort({ order: 1, createdAt: -1 })
    .exec();

  return docs.map(serializeProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await dbConnect();
  const doc = await ProjectModel.findById(id).exec();
  return doc ? serializeProject(doc) : null;
}

export async function createProject(
  payload: unknown
): Promise<Project> {
  const parsed: ProjectPayload = projectPayloadSchema.parse(payload);
  const gallery = Array.from(new Set(parsed.gallery));

  await dbConnect();
  const doc = await ProjectModel.create({
    ...parsed,
    gallery,
    imageUrl: gallery[0] ?? undefined,
  });
  return serializeProject(doc);
}

export async function updateProject(
  id: string,
  payload: unknown
): Promise<Project | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  const parsed = projectPayloadSchema.partial().parse(payload);
  const updateData: Partial<ProjectPayload> = stripUndefined(parsed);
  const updateDoc: Record<string, unknown> = { ...updateData };

  if (updateData.gallery) {
    const gallery = Array.from(new Set(updateData.gallery));
    updateDoc.gallery = gallery;
    updateDoc.imageUrl = gallery[0] ?? undefined;
  }

  await dbConnect();

  if (!Object.keys(updateDoc).length) {
    const doc = await ProjectModel.findById(id).exec();
    return doc ? serializeProject(doc) : null;
  }

  const doc = await ProjectModel.findByIdAndUpdate(id, updateDoc, {
    new: true,
  }).exec();

  return doc ? serializeProject(doc) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) {
    return false;
  }

  await dbConnect();
  const result = await ProjectModel.findByIdAndDelete(id).exec();
  return Boolean(result);
}

// Experience
export async function getExperience(): Promise<Experience[]> {
  await dbConnect();
  const docs = await ExperienceModel.find()
    .sort({ startDate: -1, createdAt: -1 })
    .exec();

  return docs.map(serializeExperience);
}

export async function getExperienceById(
  id: string
): Promise<Experience | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await dbConnect();
  const doc = await ExperienceModel.findById(id).exec();
  return doc ? serializeExperience(doc) : null;
}

export async function createExperience(payload: unknown): Promise<Experience> {
  const parsed: ExperiencePayload = experiencePayloadSchema.parse(payload);

  await dbConnect();
  const doc = await ExperienceModel.create(parsed);
  return serializeExperience(doc);
}

export async function updateExperience(
  id: string,
  payload: unknown
): Promise<Experience | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  const parsed = experiencePayloadSchema.partial().parse(payload);
  const update: Partial<ExperiencePayload> = stripUndefined(parsed);

  await dbConnect();

  if (!Object.keys(update).length) {
    const doc = await ExperienceModel.findById(id).exec();
    return doc ? serializeExperience(doc) : null;
  }

  const doc = await ExperienceModel.findByIdAndUpdate(id, update, {
    new: true,
  }).exec();

  return doc ? serializeExperience(doc) : null;
}

export async function deleteExperience(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) {
    return false;
  }

  await dbConnect();
  const result = await ExperienceModel.findByIdAndDelete(id).exec();
  return Boolean(result);
}

// Contact messages
export async function getContactMessages(): Promise<ContactMessage[]> {
  await dbConnect();
  const docs = await ContactMessageModel.find()
    .sort({ createdAt: -1 })
    .exec();

  return docs.map(serializeContactMessage);
}

export async function createContactMessage(
  payload: unknown
): Promise<ContactMessage> {
  const parsed: ContactPayload = contactPayloadSchema.parse(payload);

  await dbConnect();
  const doc = await ContactMessageModel.create(parsed);
  return serializeContactMessage(doc);
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus
): Promise<ContactMessage | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await dbConnect();
  const doc = await ContactMessageModel.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).exec();

  return doc ? serializeContactMessage(doc) : null;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) {
    return false;
  }

  await dbConnect();
  const result = await ContactMessageModel.findByIdAndDelete(id).exec();
  return Boolean(result);
}

// Certifications
export async function getCertifications(): Promise<Certification[]> {
  await dbConnect();
  const docs = await CertificationModel.find()
    .sort({ order: 1, startDate: -1, createdAt: -1 })
    .exec();

  return docs.map(serializeCertification);
}

export async function getCertificationById(
  id: string
): Promise<Certification | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await dbConnect();
  const doc = await CertificationModel.findById(id).exec();
  return doc ? serializeCertification(doc) : null;
}

export async function createCertification(
  payload: unknown
): Promise<Certification> {
  const parsed: CertificationPayload = certificationPayloadSchema.parse(
    payload
  );

  await dbConnect();
  const doc = await CertificationModel.create(parsed);
  return serializeCertification(doc);
}

export async function updateCertification(
  id: string,
  payload: unknown
): Promise<Certification | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  const parsed = certificationPayloadSchema.partial().parse(payload);
  const update: Partial<CertificationPayload> = stripUndefined(parsed);

  await dbConnect();

  if (!Object.keys(update).length) {
    const doc = await CertificationModel.findById(id).exec();
    return doc ? serializeCertification(doc) : null;
  }

  const doc = await CertificationModel.findByIdAndUpdate(id, update, {
    new: true,
  }).exec();

  return doc ? serializeCertification(doc) : null;
}

export async function deleteCertification(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) {
    return false;
  }

  await dbConnect();
  const result = await CertificationModel.findByIdAndDelete(id).exec();
  return Boolean(result);
}

export async function getHeroContent(): Promise<HeroContent> {
  await dbConnect();
  let doc = await HeroContentModel.findOne().exec();

  if (!doc) {
    doc = await HeroContentModel.create(HERO_CONTENT_SEED);
  }

  return serializeHeroContent(doc);
}

export async function updateHeroContent(payload: unknown): Promise<HeroContent> {
  const parsed = heroContentPayloadSchema.partial().parse(payload);
  const data = stripUndefined(parsed);

  await dbConnect();
  let doc = await HeroContentModel.findOne().exec();

  if (!doc) {
    doc = await HeroContentModel.create(HERO_CONTENT_SEED);
  }

  const updateDoc: Record<string, unknown> = {};

  if (data.badge !== undefined) updateDoc.badge = data.badge.trim();
  if (data.headline !== undefined) updateDoc.headline = data.headline.trim();
  if (data.description !== undefined) updateDoc.description = data.description.trim();
  if (data.primaryCtaLabel !== undefined) updateDoc.primaryCtaLabel = data.primaryCtaLabel.trim();
  if (data.primaryCtaHref !== undefined) updateDoc.primaryCtaHref = data.primaryCtaHref.trim();
  if (data.secondaryCtaLabel !== undefined) updateDoc.secondaryCtaLabel = data.secondaryCtaLabel.trim();
  if (data.secondaryCtaHref !== undefined) updateDoc.secondaryCtaHref = data.secondaryCtaHref.trim();
  if (data.linkedinHref !== undefined) updateDoc.linkedinHref = data.linkedinHref.trim();

  if (data.palette) {
    const paletteUpdate = stripUndefined(data.palette);
    Object.entries(paletteUpdate).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim().length) {
        updateDoc[`palette.${key}`] = value.trim();
      }
    });
  }

  if (!Object.keys(updateDoc).length) {
    return serializeHeroContent(doc);
  }

  const updated = await HeroContentModel.findByIdAndUpdate(
    doc._id,
    { $set: updateDoc },
    { new: true }
  ).exec();

  return serializeHeroContent(updated ?? doc);
}

export async function getAboutContent(): Promise<AboutContent> {
  await dbConnect();
  let doc = await AboutContentModel.findOne().exec();

  if (!doc) {
    doc = await AboutContentModel.create(ABOUT_CONTENT_SEED);
  }

  return serializeAboutContent(doc);
}

export async function updateAboutContent(payload: unknown): Promise<AboutContent> {
  const parsed = aboutContentPayloadSchema.partial().parse(payload);
  const data = stripUndefined(parsed);

  await dbConnect();
  let doc = await AboutContentModel.findOne().exec();

  if (!doc) {
    doc = await AboutContentModel.create(ABOUT_CONTENT_SEED);
  }

  const updateDoc: Record<string, unknown> = {};

  if (data.heading !== undefined) updateDoc.heading = data.heading.trim();
  if (data.resumeLabel !== undefined) updateDoc.resumeLabel = data.resumeLabel.trim();
  if (data.resumeUrl !== undefined) updateDoc.resumeUrl = data.resumeUrl.trim();
  if (data.secondaryLabel !== undefined)
    updateDoc.secondaryLabel = data.secondaryLabel?.trim() || undefined;
  if (data.secondaryUrl !== undefined)
    updateDoc.secondaryUrl = data.secondaryUrl?.trim() || undefined;

  if (data.paragraphs) {
    const paragraphs = data.paragraphs
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length);
    if (paragraphs.length) {
      updateDoc.paragraphs = paragraphs;
    } else if (data.paragraphs.length) {
      updateDoc.paragraphs = [];
    }
  }

  if (!Object.keys(updateDoc).length) {
    return serializeAboutContent(doc);
  }

  const updated = await AboutContentModel.findByIdAndUpdate(
    doc._id,
    { $set: updateDoc },
    { new: true }
  ).exec();

  return serializeAboutContent(updated ?? doc);
}
const portfolioService = {
  getHeroContent,
  updateHeroContent,
  getAboutContent,
  updateAboutContent,
  getSiteIdentity,
  updateSiteIdentity,
  getFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getExperience,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  getContactMessages,
  createContactMessage,
  updateContactMessageStatus,
  deleteContactMessage,
  getCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
};
export { portfolioService };
export default portfolioService;































