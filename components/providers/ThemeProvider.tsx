"use client";

import {
  PropsWithChildren,
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getReadableTextColor } from "@/src/lib/colorUtils";

type Theme = "light" | "dark";

type AccentOption = {
  id: string;
  label: string;
  value: string;
};

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  accentId: string;
  accentValue: string;
  setAccent: (accentId: string) => void;
  accentOptions: AccentOption[];
};

const ACCENT_OPTIONS: AccentOption[] = [
  { id: "coral", label: "Warm Coral", value: "#FF6B6B" },
  { id: "crimson", label: "Crimson Pulse", value: "#D62828" },
  { id: "amber", label: "Sunset Amber", value: "#FF8E3C" },
  { id: "Soft-Mocha", label: "Soft Mocha", value: "#78716C" },
  { id: "lime", label: "Lime Zest", value: "#8AC926" },
  { id: "seaglass", label: "Mint Seaglass", value: "#06D6A0" },
  { id: "teal", label: "Deep Teal", value: "#2A9D8F" },
  { id: "sky", label: "Skyline Blue", value: "#118AB2" },
  { id: "azure", label: "Azure Bay", value: "#1B9AAA" },
  { id: "indigo", label: "Royal Indigo", value: "#4361EE" },
  { id: "violet", label: "Electric Violet", value: "#7F5AF0" },
  { id: "yellow", label: "Golden Yellow", value: "#FFD700" },
];

const ACCENT_LOOKUP = new Map(ACCENT_OPTIONS.map((option) => [option.id, option]));

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "portfolio-theme";
const ACCENT_STORAGE_KEY = "portfolio-accent";
const DEFAULT_ACCENT_ID = "teal";
const DEFAULT_THEME: Theme = "light";

function resolvePreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function resolveStoredAccent(): string {
  if (typeof window === "undefined") {
    return DEFAULT_ACCENT_ID;
  }

  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
  if (stored && ACCENT_LOOKUP.has(stored)) {
    return stored;
  }

  return DEFAULT_ACCENT_ID;
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  const themes: Theme[] = ["light", "dark"];
  themes.forEach((value) => root.classList.remove(value));
  root.classList.add(theme);
}

function applyAccent(accentId: string) {
  const root = document.documentElement;
  const accent = ACCENT_LOOKUP.get(accentId) ?? ACCENT_LOOKUP.get(DEFAULT_ACCENT_ID)!;
  root.style.setProperty("--color-accent", accent.value);
  root.style.setProperty("--color-on-accent", getReadableTextColor(accent.value));
  root.dataset.accent = accent.id;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [accentId, setAccentId] = useState<string>(DEFAULT_ACCENT_ID);

  const didResolveTheme = useRef(false);
  const didResolveAccent = useRef(false);

  useEffect(() => {
    if (didResolveTheme.current) {
      return;
    }
    didResolveTheme.current = true;

    if (typeof window === "undefined") {
      return;
    }
    const preferredTheme = resolvePreferredTheme();
    if (preferredTheme !== theme) {
      startTransition(() => {
        setThemeState(preferredTheme);
      });
    }
  }, [theme]);

  useEffect(() => {
    if (didResolveAccent.current) {
      return;
    }
    didResolveAccent.current = true;

    if (typeof window === "undefined") {
      return;
    }
    const storedAccent = resolveStoredAccent();
    if (storedAccent !== accentId) {
      startTransition(() => {
        setAccentId(storedAccent);
      });
    }
  }, [accentId]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    applyThemeClass(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    applyAccent(accentId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, accentId);
    }
  }, [accentId]);

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const setAccent = useCallback((value: string) => {
    if (!ACCENT_LOOKUP.has(value)) {
      return;
    }
    setAccentId(value);
  }, []);

  const accent = ACCENT_LOOKUP.get(accentId) ?? ACCENT_LOOKUP.get(DEFAULT_ACCENT_ID)!;

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      accentId: accent.id,
      accentValue: accent.value,
      setAccent,
      accentOptions: ACCENT_OPTIONS,
    }),
    [theme, accent, setAccent, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
