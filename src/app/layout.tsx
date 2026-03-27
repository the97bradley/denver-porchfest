import type { Metadata } from "next";
import { Merriweather, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://denverporchfest.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Denver PorchFest",
    template: "%s | Denver PorchFest",
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
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "Denver Porchfest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Denver Porchfest | Official Site",
    description:
      "A front-porch music day for Denver neighbors. Explore lineup, neighborhood footprint, and how to get involved.",
    images: ["/og-image"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
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
      className={`${sourceSans.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
