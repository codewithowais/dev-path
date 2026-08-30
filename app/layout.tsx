import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dev-path-omega.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "DevPath",
  title: {
    default: "DevPath — Learn to code & grow your career, in plain words",
    template: "%s · DevPath",
  },
  description:
    "A beginner-friendly hub: figure out what to learn, see where your job title can grow, and understand data structures, algorithms, and design patterns explained like a patient friend.",
  keywords: [
    "learn to code",
    "data structures",
    "algorithms",
    "design patterns",
    "career path",
    "beginner programming",
  ],
  authors: [{ name: "codewithowais", url: "https://github.com/codewithowais" }],
  creator: "codewithowais",
  publisher: "codewithowais",
  openGraph: {
    type: "website",
    siteName: "DevPath by codewithowais",
    url: siteUrl,
    title: "DevPath — Learn to code & grow your career, in plain words",
    description:
      "Figure out what to learn, see where your job title can grow, and understand data structures, algorithms, and design patterns — explained like a patient friend, with runnable code and the exact output you should expect.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPath — Learn to code & grow your career, in plain words",
    description:
      "A beginner-friendly hub for learning to code and growing your tech career, in plain words.",
    creator: "@codewithowais",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
