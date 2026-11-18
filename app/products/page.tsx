import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser, CatalogView } from "@/components/catalog-browser";
import { Arrow, Container, Eyebrow } from "@/components/ui";
import { navigationCategories, products } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Carbide Cutting Tools & CNC Toolholding Catalog",
  "Browse MAIVIDA cutting tool and CNC toolholding models. Compare catalog references and send your model, quantity and machining requirements for a quote.",
  "/products/",
);

const productCatalogs = [
  {
    title: "Comprehensive Product Catalog",
    description: "An overview of MAIVIDA product categories and solutions.",
    size: "163.5 MB",
    url: process.env.NEXT_PUBLIC_CATALOG_COMPREHENSIVE_URL || "https://drive.google.com/file/d/1ypTsaZkS6xG3kCnr92GDJm8GSK7yUoDK/view?usp=drive_link",
  },
  {
    title: "Carbide Cutting Tools",
    description: "Cutting-tool ranges, including carbide tools and related products.",
    size: "38 MB",
    url: process.env.NEXT_PUBLIC_CATALOG_CUTTING_TOOLS_URL || "https://drive.google.com/file/d/1zHKcAE0-O_RYGUdxld2KVx8vDZyZsVvc/view?usp=drive_link",
  },
  {
    title: "Mining & Construction Tools",
    description: "Carbide products for mining, construction and related applications.",
    size: "20.7 MB",
    url: process.env.NEXT_PUBLIC_CATALOG_MINING_URL || "https://drive.google.com/file/d/1qYGap9VCnejLN423YKVjPsUDCXYRRj_Z/view?usp=drive_link",
  },
  {
    title: "Carbide Rods",
    description: "MAIVIDA hard-alloy rod product information.",
    size: "15.8 MB",
    url: process.env.NEXT_PUBLIC_CATALOG_RODS_URL || "https://drive.google.com/file/d/1uo0TOC_dONQWQtgeiro2WKu1k6xSJ6gd/view?usp=drive_link",
  },
];

function ProductCatalogs() {
  return <section id="product-catalogs" aria-labelledby="product-catalogs-title" className="border-b border-line bg-paper">
    <Container className="py-12 md:py-16">
      <div className="max-w-2xl">
        <Eyebrow>MAIVIDA resources</Eyebrow>
        <h2 id="product-catalogs-title" className="mt-4 text-3xl md:text-4xl">Product catalogs</h2>
        <p className="mt-4 text-sm leading-7 text-muted">Browse our four product catalogs. Open a PDF in Google Drive, then use the download button to save a copy. Larger files may take longer to load.</p>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {productCatalogs.map((catalog, index) => <li key={catalog.title} className="flex min-h-56 flex-col border border-line bg-white p-6">
          <span className="text-[10px] font-semibold tracking-[.16em] text-muted">CATALOG / 0{index + 1}</span>
          <h3 className="mt-5 text-xl">{catalog.title}</h3>
          <p className="mt-3 flex-1 text-sm leading-6 text-muted">{catalog.description}</p>
          <p className="mt-4 text-xs text-muted">PDF / {catalog.size}</p>
          <a href={catalog.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center justify-between gap-4 border-t border-line pt-4 text-xs font-semibold text-steel hover:text-orange" aria-label={`View or download ${catalog.title} PDF (opens in a new tab)`}>
            View / Download PDF <Arrow diagonal />
          </a>
        </li>)}
      </ul>
    </Container>
  </section>;
}

export default function Products() {
  // The build reads private JSON on the server. The exported browser receives
  // normalized English display data only; original bilingual rows stay private.
  return <>
    <ProductCatalogs />
    <Suspense fallback={<CatalogView products={products} categories={navigationCategories} />}>
      <CatalogBrowser products={products} categories={navigationCategories} />
    </Suspense>
  </>;
}
