"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import type { Skill } from "@/src/types/portfolio";

type SkillsSectionProps = {
  skills: Skill[];
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Skill[]>();
    skills
      .slice()
      .sort((a, b) => a.order - b.order)
      .forEach((skill) => {
        const bucket = map.get(skill.category) ?? [];
        bucket.push(skill);
        map.set(skill.category, bucket);
      });
    return Array.from(map.entries());
  }, [skills]);

  return (
    <section
      id="skills"
      className="mx-auto mt-[var(--section-gap)] w-full max-w-5xl px-4"
    >
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-3xl">
          Skills
        </h2>
        <span className="text-sm text-[color:var(--color-muted)]">
          Continuously learning & shipping.
        </span>
      </div>
      {grouped.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {grouped.map(([category, categorySkills], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.35 }}
              className="surface-card card-hover rounded-2xl p-6 animate-scale-up"
            >
              <h3 className="mb-4 text-lg font-semibold text-[color:var(--color-foreground)]">
                {category}
              </h3>
              <div className="flex flex-wrap gap-3">
                {categorySkills.map((skill) => (
                  <span
                    key={skill._id}
                    className="skill-tag rounded-full border border-[color:var(--color-accent-outline)] bg-[color:var(--color-accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-wide"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="surface-card rounded-2xl border-dashed p-10 text-center text-[color:var(--color-muted)]" suppressHydrationWarning>
          Skills will appear here once you seed your database.
        </div>
      )}
    </section>
  );
}
