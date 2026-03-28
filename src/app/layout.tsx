import type { Metadata } from "next";
import Script from "next/script";
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
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

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
      <body className="min-h-full flex flex-col">
        {children}
        {gaMeasurementId ? (
          <>
            <Script id="ga4-exclude-toggle" strategy="beforeInteractive">
              {`
                (function () {
                  var key = 'denverPorchfestExcludeAnalytics';
                  var params = new URLSearchParams(window.location.search);
                  var setOn = params.get('exclude_me') === '1';
                  var setOff = params.get('exclude_me') === '0';

                  if (setOn) localStorage.setItem(key, '1');
                  if (setOff) localStorage.removeItem(key);

                  var excluded = localStorage.getItem(key) === '1';
                  if (excluded) {
                    window['ga-disable-${gaMeasurementId}'] = true;
                    window.__dpfAnalyticsExcluded = true;
                  }
                })();
              `}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
