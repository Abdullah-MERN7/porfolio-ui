"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTheme } from "@/components/providers/ThemeProvider";

const mobileQuery = "(max-width: 768px)";

export function AccentPaletteSelector() {
  const { accentId, setAccent, accentOptions } = useTheme();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mq = window.matchMedia(mobileQuery);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) {
        return;
      }
      if (event.target instanceof Node && containerRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const activeAccent = useMemo(
    () =>
      accentOptions.find((option) => option.id === accentId) ?? accentOptions[0],
    [accentOptions, accentId]
  );

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <div className="palette-control" ref={containerRef} suppressHydrationWarning>
      <button
        type="button"
        className="palette-trigger"
        onClick={toggleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Accent colour menu. Current selection: ${activeAccent.label}`}
        ref={triggerRef}
      >
        <span
          className="palette-trigger__chip"
          style={{ background: activeAccent.value }}
          aria-hidden="true"
        />
        <span className="palette-trigger__label">Palette</span>
        <svg
          className={clsx("palette-trigger__chevron", open && "palette-trigger__chevron--open")}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M2.2 4.25a.75.75 0 0 1 1.06 0L6 6.94l2.74-2.69a.75.75 0 0 1 1.05 1.07L6.52 8.56a1 1 0 0 1-1.42 0L2.2 5.32a.75.75 0 0 1 0-1.07Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={clsx(
              "palette-popover",
              isMobile ? "palette-popover--inline" : "palette-popover--desktop"
            )}
            role="dialog"
            aria-label="Choose accent colour"
            initial={{ opacity: 0, y: isMobile ? 0 : 8, scale: isMobile ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? 0 : 4, scale: isMobile ? 1 : 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="palette-popover__header">
              <span className="palette-popover__title">Accent colour</span>
              <button
                type="button"
                className="palette-popover__close"
                onClick={() => setOpen(false)}
                aria-label="Close accent colour menu"
              >
                X
              </button>
            </div>
            <div className="palette-grid">
              {accentOptions.map((option) => {
                const isActive = option.id === accentId;
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    className={clsx(
                      "palette-swatch",
                      isActive && "palette-swatch--active",
                      "palette-swatch--interactive"
                    )}
                    role="radio"
                    aria-label={`Accent colour: ${option.label}`}
                    aria-checked={isActive}
                    title={option.label}
                    style={{ backgroundColor: option.value }}
                    onClick={() => {
                      setAccent(option.id);
                      if (isMobile) {
                        setOpen(false);
                      }
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 320, damping: 25 }}
                  >
                    <span className="sr-only">{option.label}</span>
                    <span className="palette-swatch__indicator" aria-hidden="true" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



