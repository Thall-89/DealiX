import type { MetadataRoute } from "next";

const site = "https://www.getdealix.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/login", "/signup"], disallow: ["/", "/api/"] }],
    sitemap: `${site}/sitemap.xml`,
  };
}
