import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { WhatsAppButton } from "@/components/widgets/WhatsAppButton";

import { fetchFromApi } from "@/src/lib/apiClient";
import { CACHE_TAGS } from "@/src/lib/cacheTags";
import { SITE_IDENTITY_FALLBACK } from "@/src/lib/defaultContent";
import { getSiteIdentity } from "@/src/lib/portfolioService";
import type { SiteIdentity } from "@/src/types/portfolio";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

async function loadSiteIdentity(): Promise<SiteIdentity> {
  try {
    return await getSiteIdentity();
  } catch (error) {
    console.error("Failed to load site identity", error);
    return SITE_IDENTITY_FALLBACK;
  }
}


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Abdullah Tahir | MERN Stack Developer",
    template: "%s | Abdullah Tahir",
  },
  description:
    "Crafting responsive, secure web & mobile apps with React.js, Node.js, Next.js.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Abdullah Tahir | MERN Stack Developer",
    description:
      "Crafting responsive, secure web & mobile apps with React.js, Node.js, Next.js.",
    url: siteUrl,
    siteName: "Abdullah Tahir Portfolio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/abd-banner.png",
        width: 1200,
        height: 630,
        alt: "Abdullah Tahir | MERN Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abdullah Tahir | MERN Stack Developer",
    description:
      "Crafting responsive, secure web & mobile apps with React.js, Node.js, Next.js.",
    images: ["/abd-banner.png"],
  },
};

const THEME_SCRIPT = `
  (function() {
    try {
      var root = document.documentElement;
      var themeKey = 'portfolio-theme';
      var storedTheme = localStorage.getItem(themeKey);
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : (prefersDark ? 'dark' : 'light');
      root.classList.remove('light', 'dark');
      root.classList.add(theme);

      var accentKey = 'portfolio-accent';
      var accentPalette = {
        coral: '#FF6B6B',
        crimson: '#D62828',
        amber: '#FF8E3C',
        sunny: '#FFD166',
        lime: '#8AC926',
        seaglass: '#06D6A0',
        teal: '#2A9D8F',
        sky: '#118AB2',
        azure: '#1B9AAA',
        indigo: '#4361EE',
        violet: '#7F5AF0',
        yellow: '#FFD700'
      };
      var accentId = localStorage.getItem(accentKey);
      if (!accentId || !accentPalette[accentId]) {
        accentId = 'teal';
      }
      var accentHex = accentPalette[accentId];
      root.style.setProperty('--color-accent', accentHex);
      root.style.setProperty('--color-on-accent', getReadableText(accentHex));
      root.dataset.accent = accentId;

      function getReadableText(hex) {
        var value = hex.replace('#', '');
        if (value.length === 3) {
          value = value.split('').map(function(char) { return char + char; }).join('');
        }
        if (value.length !== 6) {
          return '#0D0D0D';
        }
        var r = parseInt(value.slice(0, 2), 16) / 255;
        var g = parseInt(value.slice(2, 4), 16) / 255;
        var b = parseInt(value.slice(4, 6), 16) / 255;
        var channels = [r, g, b].map(function(channel) {
          return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
        });
        var luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        var contrastWithWhite = (1.05) / (luminance + 0.05);
        var contrastWithBlack = (luminance + 0.05) / 0.05;
        return contrastWithBlack >= contrastWithWhite ? '#0D0D0D' : '#FFFFFF';
      }
    } catch (error) {
      console.warn('Theme initialization failed', error);
    }
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteIdentity = await loadSiteIdentity();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <Script id="theme-initializer" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        <Script id="bitdefender-cleanup" strategy="afterInteractive">
          {`
            (function() {
              function cleanup() {
                document.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
              }
              cleanup();
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                    mutation.target.removeAttribute('bis_skin_checked');
                  }
                  mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                      if (node.hasAttribute('bis_skin_checked')) node.removeAttribute('bis_skin_checked');
                      node.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
                    }
                  });
                });
              });
              observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['bis_skin_checked']
              });
            })();
          `}
        </Script>
        <ThemeProvider>
          <>
            <div className="relative min-h-screen animate-scale-up" suppressHydrationWarning>
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--color-accent-soft-strong),transparent_60%)]" suppressHydrationWarning />
              <Navbar siteIdentity={siteIdentity} />
              <main suppressHydrationWarning>{children}</main>
              <Footer siteIdentity={siteIdentity} />
            </div>
            <WhatsAppButton />
          </>
        </ThemeProvider>
      </body>
    </html>
  );
}
