"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    id: "Furqan Farid",
    quote:
      "Working closely with him made the design-to-development process smooth and efficient.I highly recommend Abdullah to anyone looking for a dedicated and skilled developer who truly understands the value of collaboration between design and development.",
    name: "Furqan Farid",
    role: "UX/UI",
  },
  {
    id: "Rana M Muzamil",
    quote:
      "I worked with Abdullah on the Portfolio Website. Their ability to write clean React components/Node.js expertise was invaluable. Always professional and great in his skills!",
    name: "Rana M Muzamil",
    role: "Marketing Manager @Oporto",
  },
  {
    id: "Amitgptai",
    quote:
      "React Native simple app expo project. Good work , good freelancer",
    name: "Amitgptai",
    role: "AI developer",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="mx-auto mt-[var(--section-gap)] w-full max-w-5xl px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10 text-center animate-fade-in"
      >
        <span className="badge-accent">Testimonials</span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-3xl">
          Teams that trust the craft
        </h2>
        <p className="mt-3 text-base text-[color:var(--color-muted)]">
          A few words from partners who brought ambitious ideas to life.
        </p>
      </motion.div>
      <div className="grid gap-6 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <motion.blockquote
            key={testimonial.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
            className="surface-card card-hover relative flex h-full flex-col gap-6 rounded-3xl p-7 animate-slide-in"
          >
            <span className="text-5xl font-serif text-[color:var(--color-accent-soft-strong)]">&quot;</span>
            <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
              {testimonial.quote}
            </p>
            <footer className="mt-auto border-t border-[color:var(--color-surface-border)] pt-4 text-xs uppercase tracking-wide text-[color:var(--color-muted)]">
              <span className="block text-sm font-semibold text-[color:var(--color-foreground)]">
                {testimonial.name}
              </span>
              {testimonial.role}
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
