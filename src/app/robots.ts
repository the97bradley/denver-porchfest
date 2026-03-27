import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://denverporchfest.com/sitemap.xml",
    host: "https://denverporchfest.com",
  };
}
