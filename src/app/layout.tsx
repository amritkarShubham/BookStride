import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1A4731",
};

export const metadata: Metadata = {
  title: "Bookstride — Track Your Reading Journey",
  description:
    "Bookstride is your personal reading tracker. Upload PDFs and ePubs, track your reading speed, build streaks, and visualize your literary journey like never before.",
  keywords: [
    "reading tracker",
    "book tracker",
    "WPM tracker",
    "strava for books",
    "reading habits",
    "PDF reader",
    "ePub reader",
  ],
  authors: [{ name: "Bookstride" }],
  openGraph: {
    title: "Bookstride — Track Your Reading Journey",
    description: "Your personal Strava for Books. Track WPM, build streaks, and own your reading data.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "Bookstride",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
};

import { Sidebar } from "@/components/layout/sidebar";
import { SettingsModal } from "@/components/layout/settings-modal";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <TooltipProvider>
          {children}
          <Sidebar />
          <SettingsModal />
        </TooltipProvider>
      </body>
    </html>
  );
}
