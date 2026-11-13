import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser, CatalogView } from "@/components/catalog-browser";
import { navigationCategories, products } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Product catalog",
  description: "Search MAIWEIDA catalog models and filter by the available English product categories. Confirm specifications with a model-specific enquiry.",
  alternates: { canonical: absoluteUrl("/products") },
};

export default function Products() {
  // The build reads private JSON on the server. The exported browser receives
  // normalized English display data only; original bilingual rows stay private.
  return <Suspense fallback={<CatalogView products={products} categories={navigationCategories} />}>
    <CatalogBrowser products={products} categories={navigationCategories} />
  </Suspense>;
}
