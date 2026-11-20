import type { Metadata } from "next";
import { EndMillCatalog } from "@/components/end-mill-catalog";
import { products } from "@/lib/catalog";
import { jsonLdString } from "@/lib/catalog-core";
import { END_MILL_FAMILIES, END_MILLS_DESCRIPTION, END_MILLS_PATH, END_MILLS_TITLE, endMillHeading } from "@/lib/end-mill-catalog";
import { canonicalUrl, pageMetadata, productPath } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(END_MILLS_TITLE, END_MILLS_DESCRIPTION, END_MILLS_PATH);

export default function SolidCarbideEndMills() {
  const endMills = END_MILL_FAMILIES.flatMap(family => products.filter(product => product.endMill && product.categoryId === family.id));
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage", name: END_MILLS_TITLE, description: END_MILLS_DESCRIPTION, url: canonicalUrl(END_MILLS_PATH),
        mainEntity: {
          "@type": "ItemList", numberOfItems: endMills.length,
          itemListElement: endMills.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: endMillHeading(product), url: canonicalUrl(productPath(product.id)) })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "Products", item: canonicalUrl("/products/") },
          { "@type": "ListItem", position: 3, name: END_MILLS_TITLE, item: canonicalUrl(END_MILLS_PATH) },
        ],
      },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(schema) }} />
    <EndMillCatalog products={endMills} />
  </>;
}
