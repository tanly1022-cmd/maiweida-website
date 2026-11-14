import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser, CatalogView } from "@/components/catalog-browser";
import { navigationCategories, products } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Carbide Cutting Tools & CNC Toolholding Catalog",
  "Browse MAIVIDA cutting tool and CNC toolholding models. Compare catalog references and send your model, quantity and machining requirements for a quote.",
  "/products/",
);

export default function Products() {
  // The build reads private JSON on the server. The exported browser receives
  // normalized English display data only; original bilingual rows stay private.
  return <Suspense fallback={<CatalogView products={products} categories={navigationCategories} />}>
    <CatalogBrowser products={products} categories={navigationCategories} />
  </Suspense>;
}
