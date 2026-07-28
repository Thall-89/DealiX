import type { MetadataRoute } from "next";

const site = "https://www.getdealix.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site}/signup`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
