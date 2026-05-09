"use client";

import { motion } from "framer-motion";

import { FEATURES_FALLBACK } from "@/src/lib/defaultContent";
import { DEFAULT_FEATURE_ICON, FEATURE_ICON_MAP, FeatureIconKey } from "@/src/lib/featureIcons";
import type { Feature } from "@/src/types/portfolio";

type FeaturesSectionProps = {
  features?: Feature[];
};

const compareByOrder = (a: Feature, b: Feature) => {
  const orderA = a.order ?? 0;
  const orderB = b.order ?? 0;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  return a.title.localeCompare(b.title);
};

export function FeaturesSection({ features }: FeaturesSectionProps) {
  const items = features && features.length ? features : FEATURES_FALLBACK;
  const ordered = [...items].sort(compareByOrder);

  return (
    <section
      id="features"
      className="mx-auto mt-[var(--section-gap)] w-full max-w-6xl px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10 max-w-2xl animate-slide-in"
      >
        <span className="badge-accent">What I bring</span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-3xl">
          End-to-end product partnership
        </h2>
        <p className="mt-3 text-base text-[color:var(--color-muted)]">
          Pair strategic thinking with hands-on engineering. Each engagement is focused on measurable outcomes, sustainable systems, and a collaborative cadence.
        </p>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ordered.map((feature, index) => {
          const iconKey = feature.icon as FeatureIconKey;
          const Icon = FEATURE_ICON_MAP[iconKey] ?? DEFAULT_FEATURE_ICON;

          return (
            <motion.article
              key={feature._id}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
              className="surface-card card-hover rounded-3xl p-6 animate-scale-up"
            >
              <div className="accent-icon mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--color-accent-outline)] bg-[color:var(--color-accent-soft)] animate-flip-3d">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">
                {feature.description}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
