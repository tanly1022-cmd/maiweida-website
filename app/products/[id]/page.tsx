import { EndMillOptions } from "@/components/end-mill-options";
import { EndMillSpecifications } from "@/components/end-mill-specifications";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { MiningToolDetail } from "@/components/mining-tool-detail";
import { InsertOptions } from "@/components/insert-options";
import { recommendationSymbols } from "@/lib/insert-options";
import { ProductImage } from "@/components/product-card";
import { Arrow, Breadcrumbs, Container, Eyebrow } from "@/components/ui";
import { getProduct, products } from "@/lib/catalog";
import { jsonLdString, miningAppearanceProducts, miningAppearanceTitle } from "@/lib/catalog-core";
import { absoluteUrl, rfqHref } from "@/lib/site";
import { canonicalUrl, productMetadata, productPath } from "@/lib/seo";
import { END_MILL_FAMILIES, END_MILLS_PATH, endMillHeading, endMillSummary } from "@/lib/end-mill-catalog";
type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export const revalidate = false;
export function generateStaticParams() { return products.map(p => ({ id: p.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params, product = getProduct(id);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return productMetadata(product);
}
export default async function ProductDetail({ params }: Props) {
  const { id } = await params, product = getProduct(id);
  if (!product) notFound();
  const heading = product.endMill ? endMillHeading(product) : product.model;
  const summary = endMillSummary(product);
  const endMillFamily = END_MILL_FAMILIES.find(family => family.id === product.categoryId);
  const variants = product.insertFamily ? products.filter(item => item.insertFamily === product.insertFamily) : [product];
  const schema = { "@context": "https://schema.org", "@type": "Product", name: heading, model: product.model, description: product.description,
    ...(summary ? { material: product.material, additionalProperty: [
      { "@type": "PropertyValue", name: "Catalog cutting diameter range", value: summary.diameter, unitText: "mm" },
      { "@type": "PropertyValue", name: "Flutes", value: summary.flutes },
      { "@type": "PropertyValue", name: "Catalog dimension combinations", value: summary.options },
    ] } : {}),
    ...(product.category ? { category: product.category } : {}),
    ...(product.image && absoluteUrl(product.image) ? { image: absoluteUrl(product.image) } : {}),
    url: canonicalUrl(productPath(product.id)) };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(schema) }} />
    <Container>
      <Breadcrumbs items={[{ label: "Products", href: "/products/" }, ...(product.endMill ? [{ label: "Solid Carbide End Mills", href: END_MILLS_PATH }, ...(endMillFamily ? [{ label: endMillFamily.title, href: `${END_MILLS_PATH}#${endMillFamily.id}` }] : [])] : product.category ? [{ label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` }] : []), { label: product.miningTool ? miningAppearanceTitle(product) : product.model }]} />
      {product.miningTool ? <MiningToolDetail key={product.id} product={product} geometries={miningAppearanceProducts(product, products)} /> : <>
      <section aria-label="Product enquiry" className="grid gap-9 pb-16 md:grid-cols-[1.2fr_1fr] lg:gap-16 lg:pb-24">
        <div className="min-w-0">
          <div className="border border-line"><ProductImage product={product} large /></div>
          <p className="mt-4 max-w-xl text-xs leading-6 text-muted">{product.miningTool ? "Catalog rendering, not a product photograph. Extracted at the original resolution without enlargement. Appearance and dimensions vary by selected model; refer to the dimension table." : product.image ? (product.insertFamily ? "Catalog photograph for this insert series. Dimensions and grade availability are model-specific." : product.endMill ? "Catalog photograph for this end-mill series, displayed without enlargement beyond its original resolution. Dimensions and appearance vary by selected model; confirm the exact configuration before ordering." : "Catalog family photograph. Confirm exact size, orientation and configuration before ordering.") : product.endMill ? "Independently authored geometry schematic only; not a product photograph or a dimensional drawing. Actual appearance may differ by model." : "Placeholder illustration only; not a product photograph or dimensional drawing."}</p>
        </div>
        <div className="min-w-0 self-center border-t border-line py-8 md:border-t-0 md:py-12">
          <Eyebrow>{product.isFamilyReference ? "Family reference" : "Catalog model"}</Eyebrow>
          <p className="mt-7 text-xs font-medium text-muted">{product.miningTool ? "Product series" : "Model number"}</p>
          <h1 className="mt-3 break-anywhere text-4xl leading-tight lg:text-5xl">{heading}</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted">{product.description}</p>
          {product.endMill && <EndMillOptions key={product.id} product={product} />}
          {product.insertFamily && <InsertOptions key={product.id} product={product} variants={variants} />}
          {!product.insertFamily && product.grades?.length ? <div className="mt-7 max-w-md border-y border-line py-5">
            <p className="field-label">Available grades</p>
            <div className="flex flex-wrap gap-2" aria-label="Available grades">
              {product.grades.map(grade => <span key={grade} className="border border-line bg-paper px-3 py-2 text-xs font-medium">{grade}</span>)}
            </div>
          </div> : null}
          {!product.insertFamily && !product.endMill && !product.miningTool && <Link href={rfqHref(product.model)} className="button button-dark mt-9 w-full justify-between sm:w-auto">Request a Quote <Arrow /></Link>}
          {product.needsReview && <p className="mt-5 max-w-md text-xs leading-6 text-muted">{product.isFamilyReference ? "This is a catalog family reference, not a verified individual SKU. Include the required configuration with your enquiry." : "Catalog reference details require confirmation before ordering."}</p>}
          <Link href="/products" className="category-link mt-8 inline-block text-xs underline underline-offset-4">Back to all products</Link>
        </div>
      </section>
      <EndMillSpecifications product={product} />
      {product.insertFamily && <section aria-labelledby="insert-specifications" className="mb-16 border-t border-line pt-9">
        <Eyebrow>Geometry & specifications</Eyebrow>
        <h2 id="insert-specifications" className="mt-4 text-2xl md:text-3xl">{product.insertSeries} - model specifications</h2>
        <div className="mt-7 grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
          {product.drawing && <figure className="self-start border border-line bg-white p-5">
            <Image src={product.drawing} width={1200} height={300} unoptimized className="h-auto w-full object-contain" alt={`Dimensional reference drawing for ${product.insertSeries}`} />
            <figcaption className="mt-3 text-xs leading-6 text-muted">Dimensional reference. Refer to the selected model row for values.</figcaption>
          </figure>}
          <div className="min-w-0 overflow-x-auto border border-line">
            <table className="spec-table min-w-[640px]">
              <caption className="sr-only">Model dimensions and grade options for {product.insertSeries}</caption>
              <thead><tr><th>Model</th>{product.specs.map(spec => <th key={spec.label}>{spec.label}{spec.unit ? ` (${spec.unit})` : ""}</th>)}<th>Grades</th></tr></thead>
              <tbody>{variants.map(variant => <tr key={variant.id} className={variant.id === product.id ? "bg-paper" : ""}>
                <td><Link href={`/products/${variant.id}`} className="font-semibold underline underline-offset-4" aria-current={variant.id === product.id ? "page" : undefined}>{variant.model}</Link></td>
                {product.specs.map(spec => <td key={spec.label}>{variant.specs.find(item => item.label === spec.label)?.value ?? "-"}</td>)}
                <td className="min-w-40 text-xs leading-6">{variant.gradeRecommendations?.map(item => `${recommendationSymbols[item.recommendation]} ${item.grade}`).join(" / ") || "Confirm with enquiry"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
        <p className="mt-5 text-xs leading-6 text-muted">● Main recommended / ◐ General / ○ Available to produce. Blank source cells are not offered as grade options. Confirm the complete model, holder compatibility and cutting conditions before ordering.</p>
      </section>}
      </>}
    </Container>
  </>;
}
