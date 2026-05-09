"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, Mail } from "lucide-react";

import { useTheme } from "@/components/providers/ThemeProvider";
import { HERO_CONTENT_FALLBACK } from "@/src/lib/defaultContent";
import { darkenHex, lightenHex, normalizeHexColor } from "@/src/lib/colorUtils";
import type { HeroContent } from "@/src/types/portfolio";

const HERO_EASE_SOFT = [0.4, 0, 0.2, 1] as const;

// Typing controls: adjust these values to tune speed & delay between words.
const WORD_STAGGER = 0.16; // seconds between each word reveal
const WORD_ANIMATION_DURATION = 0.42; // seconds for each word animation
const POST_TYPING_DELAY = 0.35; // pause before revealing paragraphs/CTAs

// Background controls: tweak these multipliers to change parallax strength.
const PARALLAX_MULTIPLIERS = {
  glow: 10,
  waveA: 18,
  waveB: -22,
  particlesX: 32,
  particlesY: 26,
} as const;

const floatingParticles = [
  { id: "p-1", top: "18%", left: "18%", size: 10, delay: 0.2, travel: 14 },
  { id: "p-2", top: "30%", left: "72%", size: 12, delay: 0.6, travel: 18 },
  { id: "p-3", top: "64%", left: "24%", size: 8, delay: 1, travel: 16 },
  { id: "p-4", top: "72%", left: "68%", size: 14, delay: 1.4, travel: 22 },
] as const;

type HeroSectionProps = {
  content?: HeroContent;
};

type MotionTransformMap = Record<"primary" | "secondary" | "highlight", {
  x: any;
  y: any;
}>;

export function HeroSection({ content }: HeroSectionProps) {
  const hero = content ?? HERO_CONTENT_FALLBACK;
  const fallbackPalette = hero.palette ?? HERO_CONTENT_FALLBACK.palette;
  const { accentValue } = useTheme();

  const derivedPalette = useMemo(() => {
    const base =
      normalizeHexColor(accentValue ?? fallbackPalette.primary) ?? fallbackPalette.primary;
    return {
      primary: base,
      secondary: lightenHex(base, 0.18),
      accent: darkenHex(base, 0.2),
      particles: lightenHex(base, 0.35),
    };
  }, [accentValue, fallbackPalette.primary]);

  const heroThemeStyle = useMemo<Record<string, any>>(
    () => ({
      "--hero-color-primary": derivedPalette.primary,
      "--hero-color-secondary": derivedPalette.secondary,
      "--hero-color-accent": derivedPalette.accent,
      "--hero-color-particles": derivedPalette.particles,
    }),
    [derivedPalette]
  );

  const heroRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const words = useMemo(() => hero.headline.split(" "), [hero.headline]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springX = useSpring(pointerX, { damping: 30, stiffness: 120, mass: 0.38 });
  const springY = useSpring(pointerY, { damping: 30, stiffness: 120, mass: 0.38 });

  const parallax: MotionTransformMap = {
    primary: {
      x: useTransform(springX, (value) => value * (PARALLAX_MULTIPLIERS.glow / 10)),
      y: useTransform(springY, (value) => value * (PARALLAX_MULTIPLIERS.glow / 10)),
    },
    secondary: {
      x: useTransform(springX, (value) => value * (PARALLAX_MULTIPLIERS.waveA / 10)),
      y: useTransform(springY, (value) => value * (PARALLAX_MULTIPLIERS.waveA / 12)),
    },
    highlight: {
      x: useTransform(springX, (value) => value * (PARALLAX_MULTIPLIERS.waveB / 10)),
      y: useTransform(springY, (value) => value * (PARALLAX_MULTIPLIERS.waveB / 14)),
    },
  };

  const particlesX = useTransform(springX, (value) => value * (PARALLAX_MULTIPLIERS.particlesX / 10));
  const particlesY = useTransform(springY, (value) => value * (PARALLAX_MULTIPLIERS.particlesY / 10));

  useEffect(() => {
    if (prefersReducedMotion) {
      pointerX.stop();
      pointerY.stop();
      pointerX.set(0);
      pointerY.set(0);
    }
  }, [pointerX, pointerY, prefersReducedMotion]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (prefersReducedMotion || event.pointerType === "touch") {
        return;
      }

      const bounds = heroRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

      pointerX.set(relativeX * 20);
      pointerY.set(relativeY * 16);
    },
    [pointerX, pointerY, prefersReducedMotion]
  );

  const resetPointer = useCallback(() => {
    pointerX.stop();
    pointerY.stop();
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  const headingVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 1 },
      show: {
        transition: {
          delayChildren: prefersReducedMotion ? 0 : 0.2,
          staggerChildren: prefersReducedMotion ? 0 : WORD_STAGGER,
        },
      },
    }),
    [prefersReducedMotion]
  );

  const wordVariants: Variants = useMemo(
    () => ({
      hidden: prefersReducedMotion
        ? { opacity: 0 }
        : { opacity: 0, y: "0.6em", filter: "blur(8px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          duration: prefersReducedMotion ? 0.18 : WORD_ANIMATION_DURATION,
          ease: HERO_EASE_SOFT,
        },
      },
    }),
    [prefersReducedMotion]
  );

  const contentDelay = prefersReducedMotion ? 0 : words.length * WORD_STAGGER + POST_TYPING_DELAY;

  const subheadingVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        delay: contentDelay,
        duration: 0.6,
        ease: HERO_EASE_SOFT,
      },
    },
  };

  const bodyVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        delay: contentDelay + 0.1,
        duration: 0.6,
        ease: HERO_EASE_SOFT,
      },
    },
  };

  const ctaVariants: Variants = {
    hidden: { opacity: 0, y: 26, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: contentDelay + 0.18,
        duration: 0.6,
        ease: HERO_EASE_SOFT,
      },
    },
  };

  const heroShellVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.6, ease: HERO_EASE_SOFT },
    },
  };

  const textStackVariants: Variants = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: prefersReducedMotion
          ? undefined
          : { delayChildren: 0.55, staggerChildren: 0.18 },
      },
    }),
    [prefersReducedMotion],
  );

  const ctaStackVariants: Variants = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: prefersReducedMotion
          ? undefined
          : { delayChildren: 0.05, staggerChildren: 0.16 },
      },
    }),
    [prefersReducedMotion],
  );

  return (
    <motion.section
      ref={heroRef}
      id="hero"
      style={heroThemeStyle}
      className="hero-shell relative flex min-h-[88vh] flex-col justify-center overflow-hidden pt-24"
      variants={heroShellVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.65 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <motion.div className="hero-backdrop" aria-hidden="true">
        <motion.div
          className="hero-backdrop__glow"
          style={{
            x: prefersReducedMotion ? 0 : parallax.primary.x,
            y: prefersReducedMotion ? 0 : parallax.primary.y,
          }}
          animate={prefersReducedMotion ? { opacity: 0.55, scale: 1 } : { opacity: [0.42, 0.58, 0.46], scale: [1.05, 1.08, 1.02, 1.05] }}
          transition={{
            duration: prefersReducedMotion ? 0.6 : 18,
            ease: "easeInOut",
            repeat: prefersReducedMotion ? 0 : Infinity,
            repeatType: "mirror",
          }}
        />

        <motion.div
          className="hero-wave hero-wave--one"
          style={{
            x: prefersReducedMotion ? 0 : parallax.secondary.x,
            y: prefersReducedMotion ? 0 : parallax.secondary.y,
          }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.32, scale: 1 }
              : {
                  opacity: [0.24, 0.4, 0.3],
                  scale: [1.08, 1.12, 1.04, 1.08],
                  rotate: [-2, 0, -1.5, -2],
                }
          }
          transition={{
            duration: prefersReducedMotion ? 0.7 : 22,
            ease: "easeInOut",
            repeat: prefersReducedMotion ? 0 : Infinity,
            repeatType: "mirror",
          }}
        />

        <motion.div
          className="hero-wave hero-wave--two"
          style={{
            x: prefersReducedMotion ? 0 : parallax.highlight.x,
            y: prefersReducedMotion ? 0 : parallax.highlight.y,
          }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.24, scale: 1 }
              : {
                  opacity: [0.2, 0.36, 0.26],
                  scale: [1.05, 1.1, 1.03, 1.05],
                  rotate: [3, 1, 2.5, 3],
                }
          }
          transition={{
            duration: prefersReducedMotion ? 0.7 : 26,
            ease: "easeInOut",
            repeat: prefersReducedMotion ? 0 : Infinity,
            repeatType: "mirror",
            delay: 0.4,
          }}
        />

        <motion.ul
          className="hero-particles"
          style={
            prefersReducedMotion
              ? undefined
              : {
                  x: particlesX,
                  y: particlesY,
                }
          }
        >
          {floatingParticles.map(({ id, top, left, size, delay, travel }) => (
            <motion.li
              key={id}
              className="hero-particles__dot"
              style={{
                top,
                left,
                width: size,
                height: size,
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.25, scale: 1 }
                  : {
                      opacity: [0.12, 0.35, 0.24, 0.28],
                      y: [0, -travel, 0],
                      scale: [1, 1.08, 0.96, 1],
                    }
              }
              transition={{
                duration: prefersReducedMotion ? 0.6 : 16 + delay * 4,
                ease: "easeInOut",
                delay,
                repeat: prefersReducedMotion ? 0 : Infinity,
                repeatType: "mirror",
              }}
            />
          ))}
        </motion.ul>

        <div className="hero-overlay" />
      </motion.div>

      <motion.div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8 sm:gap-12 px-4 sm:px-6" variants={textStackVariants}>
        <motion.span className="badge-accent" variants={subheadingVariants}>
          {hero.badge}
        </motion.span>

        <motion.h1
          className="hero-heading text-3xl font-bold leading-tight tracking-tight text-[color:var(--color-foreground)] sm:text-4xl md:text-5xl lg:text-6xl"
          variants={headingVariants}
        >
          {words.map((word, index) => (
            <motion.span key={`${word}-${index}`} className="hero-heading__word" variants={wordVariants}>
              {word}
              {index < words.length - 1 && " "}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p className="max-w-2xl text-base sm:text-lg text-[color:var(--color-muted)]" variants={bodyVariants}>
          {hero.description}
        </motion.p>

        <motion.div className="flex flex-wrap items-center gap-4 mb-6" variants={ctaStackVariants}>
          <motion.a variants={ctaVariants}
            href={hero.primaryCtaHref || "#projects"}
            className="button-primary animate-ripple group"
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    scale: 1.04,
                    translateY: -2,
                    transition: { duration: 0.32, ease: HERO_EASE_SOFT },
                  }
            }
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          >
            <span>{hero.primaryCtaLabel}</span>
            <span className="button-icon" aria-hidden="true">
              <ArrowUpRight size={16} className="transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1.5" />
            </span>
          </motion.a>

          <motion.a variants={ctaVariants}
            href={hero.secondaryCtaHref || "#contact"}
            className="button-secondary animate-ripple group"
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    scale: 1.03,
                    translateY: -1,
                    transition: { duration: 0.28, ease: HERO_EASE_SOFT },
                  }
            }
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          >
            <span>{hero.secondaryCtaLabel}</span>
            <span className="button-icon" aria-hidden="true">
              <Mail size={16} className="transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-1" />
            </span>
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#projects"
        className="hero-scroll"
        initial={{ opacity: 0, y: 16 }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.7, y: 0 }
            : { opacity: [0, 1, 0.68, 1], y: [0, 10, 0] }
        }
        transition={{ duration: prefersReducedMotion ? 0.6 : 4.2, ease: "easeInOut", delay: 1.2, repeat: prefersReducedMotion ? 0 : Infinity }}
        aria-label="Scroll to projects"
      >
        <ArrowDown size={18} aria-hidden="true" />
      </motion.a>
    </motion.section>
  );
}












