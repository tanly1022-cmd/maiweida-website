import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Metadata route handlers must be explicitly static for output: "export".
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: absoluteUrl("/sitemap.xml") };
}
