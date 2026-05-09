"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";

type FormState = {
  name: string;
  email: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  message: "",
};

export function ContactSection() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.message || "Failed to send message");
      }

      setFeedback("Thanks for reaching out. I'll be in touch shortly!");
      setForm(initialForm);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="contact"
      className="mx-auto mt-[var(--section-gap)] w-full max-w-4xl px-4"
    >
      <div className="mb-8 animate-fade-in" suppressHydrationWarning>
        <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)] sm:text-3xl">
          Contact
        </h2>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Ready to collaborate? Share details about your project or invite me to speak.
        </p>
      </div>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="surface-strong rounded-2xl sm:rounded-3xl p-5 sm:p-8 animate-scale-up"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[color:var(--color-muted)]">
            Name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Pat Doe"
              className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-4 py-3 text-base text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-[color:var(--color-muted)]">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="you@company.com"
              className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-4 py-3 text-base text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
            />
          </label>
        </div>
        <label className="mt-6 flex flex-col gap-2 text-sm text-[color:var(--color-muted)]">
          Project Details
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, message: event.target.value }))
            }
            placeholder="Share goals, timeline, and how I can help."
            className="rounded-xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-4 py-3 text-base text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring focus:ring-[color:var(--color-accent-soft)]"
          />
        </label>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="button-primary animate-ripple disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
          {feedback && (
            <span className="text-sm text-[color:var(--color-muted)]">{feedback}</span>
          )}
        </div>
      </motion.form>
    </section>
  );
}
