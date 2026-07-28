import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.getdealix.com"),
  title: { default: "DealiX | Operations OS for PC Flipping", template: "%s | DealiX" },
  description: "The operating system for buying, building, refurbishing, and selling PCs for profit.",
  applicationName: "DealiX",
  category: "Business",
  openGraph: { type: "website", siteName: "DealiX", title: "DealiX | Operations OS for PC Flipping", description: "The operating system for buying, building, refurbishing, and selling PCs for profit." },
  twitter: { card: "summary", title: "DealiX | Operations OS for PC Flipping", description: "The operating system for buying, building, refurbishing, and selling PCs for profit." },
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "48x48" }],
    shortcut: ["/icon"],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-transparent">
        <script dangerouslySetInnerHTML={{ __html: `(() => { try { const saved = localStorage.getItem('dealix_theme'); const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; const theme = saved === 'light' || saved === 'dark' ? saved : system; document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; } catch {} })()` }} />
        {children}
      </body>
    </html>
  );
}
