"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import type { Project } from "@/src/types/portfolio";

type ProjectCardProps = {
  project: Project;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const images = useMemo(() => {
    if (project.gallery && project.gallery.length) {
      return project.gallery;
    }
    if (project.coverImage) {
      return [project.coverImage];
    }
    return [];
  }, [project.gallery, project.coverImage]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? project.coverImage;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.35 }}
      className="surface-card card-hover group relative overflow-hidden rounded-3xl"
    >
      {activeImage && (
        <div className="relative h-60 w-full overflow-hidden">
          <Image
            src={activeImage}
            alt={project.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[color:rgba(12,18,28,0.78)] via-[color:rgba(12,18,28,0.28)] to-transparent dark:from-[color:rgba(5,9,14,0.82)] dark:via-[color:rgba(5,9,14,0.4)]" />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-[color:rgba(15,23,42,0.55)] px-3 py-1.5 text-xs shadow-lg backdrop-blur">
              {images.map((image, imageIndex) => (
                <button
                  key={`${project._id}-${image}`}
                  type="button"
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    imageIndex === activeIndex
                      ? "bg-[color:var(--color-accent)]"
                      : "bg-white/40"
                  }`}
                  onClick={() => setActiveIndex(imageIndex)}
                  aria-label={`Show image ${imageIndex + 1} of ${images.length}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
          {project.featured && (
            <span className="skill-tag inline-flex items-center rounded-full border border-[color:var(--color-accent-outline)] bg-[color:var(--color-accent-soft)] px-3 py-1 font-semibold">
              Featured
            </span>
          )}
          <span>{project.techStack.slice(0, 3).join(" | ")}</span>
        </div>
        <h3 className="text-2xl font-semibold text-[color:var(--color-foreground)]">
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
          {project.description}
        </p>
        <div className="flex items-center gap-3 text-sm font-medium text-[color:var(--color-accent)]">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 link-underline"
            >
              {"Live Demo ->"}
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 link-underline"
            >
              {"Source Code ->"}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
