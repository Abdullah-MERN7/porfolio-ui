"use client";

import { motion } from "framer-motion";

import { ABOUT_CONTENT_FALLBACK } from "@/src/lib/defaultContent";
import type { AboutContent } from "@/src/types/portfolio";

type AboutSectionProps = {
  content?: AboutContent;
};

export function AboutSection({ content }: AboutSectionProps) {
  const about = content ?? ABOUT_CONTENT_FALLBACK;

  return (
    <section
      id="about"
      className="relative mx-auto mt-[var(--section-gap)] flex w-full max-w-5xl flex-col gap-8 px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.4 }}
        className="space-y-4 animate-slide-in"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-3xl">
          {about.heading}
        </h2>
        {about.paragraphs?.map((paragraph, index) => (
          <p
            key={`${index}-${paragraph.slice(0, 12)}`}
            className="text-base leading-relaxed text-[color:var(--color-muted-strong)]"
          >
            {paragraph}
          </p>
        ))}
        <div className="flex flex-wrap items-center gap-4">
          <a href={about.resumeUrl} className="button-secondary animate-ripple">
            {about.resumeLabel}
          </a>
          {about.secondaryLabel && about.secondaryUrl && (
            <a
              href={about.secondaryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-muted)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-outline)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:text-[color:var(--color-accent)]"
            >
              {about.secondaryLabel}
            </a>
          )}
        </div>
      </motion.div>
    </section>
  );
}
