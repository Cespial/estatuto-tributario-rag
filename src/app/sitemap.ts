import { MetadataRoute } from "next";
import { readFile } from "fs/promises";
import { join } from "path";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://superapp-tributaria-colombia.vercel.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/explorador`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Article pages
  try {
    const indexPath = join(process.cwd(), "public", "data", "articles-index.json");
    const raw = await readFile(indexPath, "utf-8");
    const articles: Array<{ slug: string; complexity: number }> = JSON.parse(raw);

    const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${baseUrl}/articulo/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: Math.min(0.5 + (a.complexity || 0) * 0.05, 0.9),
    }));

    return [...staticPages, ...articlePages];
  } catch {
    return staticPages;
  }
}
