import type { Metadata, Viewport } from "next";
import { EB_Garamond, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RevealObserver from "@/components/RevealObserver";
import Interactions from "@/components/Interactions";
import LiveLayer from "@/components/LiveLayer";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  display: "swap",
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: {
    default: "T&T Labs",
    template: "%s · T&T Labs",
  },
  description:
    "T&T Labs is an independent team that builds developer tools for AI agents, Windows and industrial software, and a game.",
  applicationName: "T&T Labs",
  openGraph: {
    type: "website",
    siteName: "T&T Labs",
    title: "T&T Labs",
    description: "Developer tools, software and games built by an independent team.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "T&T Labs",
    description: "Developer tools, software and games built by an independent team.",
  },
};

export const viewport: Viewport = {
  themeColor: "#F3EFE9",
};

const REVEAL_BOOT =
  "(function(d){d.classList.add('js');setTimeout(function(){if(!window.__revealReady)d.classList.remove('js')},2500)})(document.documentElement)";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${garamond.variable} ${plex.variable} ${plexMono.variable}`}
    >
      <head>
        {/* Arms the scroll reveal before first paint; disarms it if the app never starts. */}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
      </head>
      <body className="flex min-h-svh flex-col">
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <RevealObserver />
        <Interactions />
        <LiveLayer />
      </body>
    </html>
  );
}
