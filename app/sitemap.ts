import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";
import { buildSitemapEntries } from "@/lib/seo";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  // Reuse exactly the catalog used by generateStaticParams(), not raw unpublished rows.
  return buildSitemapEntries(products);
}
