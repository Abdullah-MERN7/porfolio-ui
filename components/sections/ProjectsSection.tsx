"use client";

import type { Project } from "@/src/types/portfolio";

import { ProjectCard } from "../cards/ProjectCard";

type ProjectsSectionProps = {
  projects: Project[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const ordered = projects.slice().sort((a, b) => a.order - b.order);

  return (
    <section
      id="projects"
      className="mx-auto mt-[var(--section-gap)] w-full max-w-6xl px-4"
    >
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-3xl">
          Projects
        </h2>
        <span className="text-sm text-[color:var(--color-muted)]">
          Selected work from the past few years.
        </span>
      </div>
      {ordered.length ? (
        <div className="grid gap-8 md:grid-cols-2">
          {ordered.map((project, index) => (
            <ProjectCard key={project._id} project={project} index={index} />
          ))}
        </div>
      ) : (
        <div className="surface-card grid place-items-center rounded-3xl border-dashed p-16 text-center text-[color:var(--color-muted)]">
          Projects will populate here after you create records via the API.
        </div>
      )}
    </section>
  );
}
