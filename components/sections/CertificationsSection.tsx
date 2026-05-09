"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import type { Certification } from "@/src/types/portfolio";

function formatRange(start: string, end?: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : undefined;

  const startLabel = formatter.format(startDate);
  const endLabel = endDate ? formatter.format(endDate) : "Present";

  return `${startLabel} - ${endLabel}`;
}

type CertificationsSectionProps = {
  certifications: Certification[];
};

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  const ordered = certifications
    .slice()
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }

      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  return (
    <section
      id="certifications"
      className="mx-auto mt-[var(--section-gap)] w-full max-w-6xl px-4"
    >
      <div className="mb-8 flex flex-col gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div className="space-y-2" suppressHydrationWarning>
          <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-3xl">
            Certifications
          </h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Recognised credentials that reflect continued learning and craftsmanship.
          </p>
        </div>
      </div>

      {ordered.length === 0 ? (
        <div className="surface-card grid place-items-center rounded-3xl border border-dashed border-[color:var(--color-surface-border)] p-16 text-center text-[color:var(--color-muted)]" suppressHydrationWarning>
          Certifications will appear here after you add them in the admin dashboard.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ordered.map((certification, index) => (
            <motion.article
              key={certification._id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
              className="surface-card card-hover overflow-hidden rounded-3xl"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={certification.imageUrl}
                  alt={certification.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {certification.title}
                  </h3>
                  <span className="skill-tag rounded-full bg-[color:var(--color-accent-soft)] px-3 py-1 text-xs font-semibold shrink-0">
                    {formatRange(certification.startDate, certification.endDate)}
                  </span>
                </div>
                {certification.issuer && (
                  <p className="text-sm font-medium text-[color:var(--color-muted-strong)]">
                    {certification.issuer}
                  </p>
                )}
                {certification.description && (
                  <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
                    {certification.description}
                  </p>
                )}
                {certification.credentialUrl && (
                  <a
                    href={certification.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline text-sm font-semibold text-[color:var(--color-accent)]"
                  >
                    View credential
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
