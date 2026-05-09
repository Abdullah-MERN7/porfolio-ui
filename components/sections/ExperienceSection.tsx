"use client";

import { motion } from "framer-motion";

import type { Experience } from "@/src/types/portfolio";

type ExperienceSectionProps = {
  experience: Experience[];
};

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  const sorted = experience.slice().sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <section
      id="experience"
      className="mx-auto mt-[var(--section-gap)] w-full max-w-5xl px-4"
    >
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-3xl">
          Experience
        </h2>
        <span className="text-sm text-[color:var(--color-muted)]">
          Product-driven teams I&apos;ve collaborated with.
        </span>
      </div>
      {sorted.length ? (
        <div className="relative pl-4 sm:pl-6">
          <div className="absolute left-2 sm:left-3 top-0 bottom-0 w-px bg-gradient-to-b from-[color:var(--color-accent-soft-strong)] via-[color:var(--color-surface-border)] to-transparent" />
          <div className="space-y-8">
            {sorted.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
                className="surface-card card-hover relative rounded-2xl p-6 animate-slide-in"
              >
                <span className="absolute -left-[22px] sm:-left-[26px] top-6 flex h-3 w-3 sm:h-4 sm:w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-background)] bg-[color:var(--color-accent)]" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                      {item.role} - {item.company}
                    </h3>
                    <p className="text-sm text-[color:var(--color-muted)]">
                      {formatRange(item.startDate, item.endDate, item.isCurrent)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-medium text-[color:var(--color-muted)]">
                    {item.techStack.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-[color:var(--color-surface-border)] px-3 py-1"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-muted)]">
                  {item.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[color:var(--color-accent)]" />
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="surface-card rounded-2xl border-dashed p-10 text-center text-[color:var(--color-muted)]" suppressHydrationWarning>
          Experience entries will display here after seeding your database.
        </div>
      )}
    </section>
  );
}

function formatRange(startDate: string, endDate?: string, isCurrent?: boolean) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : undefined;

  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const startLabel = formatter.format(start);
  const endLabel = isCurrent
    ? "Present"
    : end
      ? formatter.format(end)
      : "Present";

  return `${startLabel} - ${endLabel}`;
}
