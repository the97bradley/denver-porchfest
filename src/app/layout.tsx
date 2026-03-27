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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://denverporchfest.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Denver Porchfest | Official Site",
    template: "%s | Denver Porchfest",
  },
  description:
    "Denver Porchfest official site: lineup, neighborhood porches, local businesses, volunteer signup, and sponsor information.",
  keywords: [
    "Denver Porchfest",
    "Denver music festival",
    "porchfest denver",
    "Denver live music",
    "South Broadway Denver events",
    "Denver neighborhood festival",
  ],
  openGraph: {
    title: "Denver Porchfest | Official Site",
    description:
      "A front-porch music day for Denver neighbors. Explore lineup, neighborhood footprint, and how to get involved.",
    url: "/",
    siteName: "Denver Porchfest",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Denver Porchfest | Official Site",
    description:
      "A front-porch music day for Denver neighbors. Explore lineup, neighborhood footprint, and how to get involved.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
