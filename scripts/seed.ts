import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import mongoose from "mongoose";

import { dbConnect } from "../src/lib/dbConnect";
import ContactMessageModel from "../src/models/ContactMessage";
import ExperienceModel from "../src/models/Experience";
import ProjectModel from "../src/models/Project";
import SkillModel from "../src/models/Skill";

async function seed() {
  await dbConnect();

  console.log("🧹 Clearing existing collections...");
  await Promise.all([
    SkillModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    ExperienceModel.deleteMany({}),
    ContactMessageModel.deleteMany({}),
  ]);

  console.log("🌱 Seeding skills...");
  await SkillModel.insertMany([
    {
      name: "Next.js",
      category: "Frontend",
      level: "Expert",
      order: 1,
    },
    {
      name: "React",
      category: "Frontend",
      level: "Expert",
      order: 2,
    },
    {
      name: "TypeScript",
      category: "Frontend",
      level: "Expert",
      order: 3,
    },
    {
      name: "Tailwind CSS",
      category: "Frontend",
      level: "Advanced",
      order: 4,
    },
    {
      name: "Node.js",
      category: "Backend",
      level: "Advanced",
      order: 5,
    },
    {
      name: "GraphQL",
      category: "Backend",
      level: "Advanced",
      order: 6,
    },
    {
      name: "MongoDB",
      category: "Backend",
      level: "Advanced",
      order: 7,
    },
    {
      name: "AWS",
      category: "DevOps",
      level: "Intermediate",
      order: 8,
    },
    {
      name: "Docker",
      category: "DevOps",
      level: "Advanced",
      order: 9,
    },
  ]);

  console.log("🌱 Seeding projects...");
  await ProjectModel.insertMany([
    {
      title: "Velocity Dashboard",
      description:
        "Engineering analytics platform with real-time velocity insights, sprint forecasting, and team health indicators.",
      techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
      imageUrl:
        "https://res.cloudinary.com/demo/image/upload/v1697033890/samples/ecommerce/leather-bag-gray.jpg",
      gallery: ["https://res.cloudinary.com/demo/image/upload/v1697033890/samples/ecommerce/leather-bag-gray.jpg"],
      liveUrl: "https://velocity.example.com",
      repoUrl: "https://github.com/example/velocity-dashboard",
      featured: true,
      order: 1,
    },
    {
      title: "Atlas Design System",
      description:
        "Composable design system powering a suite of SaaS products with accessible, themeable React components.",
      techStack: ["React", "Storybook", "Tailwind", "Radix UI"],
      imageUrl:
        "https://res.cloudinary.com/demo/image/upload/v1697033890/samples/landscapes/nature-mountains.jpg",
      gallery: ["https://res.cloudinary.com/demo/image/upload/v1697033890/samples/landscapes/nature-mountains.jpg"],
      liveUrl: "https://atlas.example.com",
      repoUrl: "https://github.com/example/atlas-design-system",
      featured: false,
      order: 2,
    },
    {
      title: "Pulse Ops Center",
      description:
        "Operational hub aggregating incident data, on-call rotations, and automated runbooks for SRE teams.",
      techStack: ["Next.js", "tRPC", "MongoDB", "Tailwind"],
      imageUrl:
        "https://res.cloudinary.com/demo/image/upload/v1697033890/samples/landscapes/beach-boat.jpg",
      gallery: ["https://res.cloudinary.com/demo/image/upload/v1697033890/samples/landscapes/beach-boat.jpg"],
      liveUrl: "https://pulse.example.com",
      repoUrl: "https://github.com/example/pulse-ops-center",
      featured: false,
      order: 3,
    },
  ]);

  console.log("🌱 Seeding experience...");
  await ExperienceModel.insertMany([
    {
      company: "Nebula Labs",
      role: "Senior Frontend Engineer",
      startDate: new Date("2022-02-01"),
      isCurrent: true,
      achievements: [
        "Led the rebuild of the analytics platform using Next.js App Router, improving TTFB by 41%.",
        "Introduced component-driven architecture and automated visual regression testing.",
        "Mentored a team of five engineers through quarterly growth initiatives.",
      ],
      techStack: ["Next.js", "React", "Tailwind", "GraphQL", "Playwright"],
    },
    {
      company: "Orbit Systems",
      role: "Full-Stack Engineer",
      startDate: new Date("2019-06-01"),
      endDate: new Date("2022-01-01"),
      achievements: [
        "Delivered multi-tenant SaaS platform serving 20k+ daily active users.",
        "Implemented serverless architecture and observability tooling across environments.",
        "Collaborated with design to build an accessible component library.",
      ],
      techStack: ["Next.js", "Node.js", "MongoDB", "Terraform"],
    },
  ]);

  console.log("✅ Seed data inserted successfully.");
}

seed()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
