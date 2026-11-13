import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductImage } from "@/components/product-card";
import { Arrow, Breadcrumbs, Container, Eyebrow } from "@/components/ui";
import { getProduct, products } from "@/lib/catalog";
import { jsonLdString } from "@/lib/catalog-core";
import { absoluteUrl, rfqHref } from "@/lib/site";
type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export const revalidate = false;
export function generateStaticParams() { return products.map(p => ({ id: p.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params, product = getProduct(id);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return { title: product.model, description: product.description.slice(0, 170), alternates: { canonical: absoluteUrl(`/products/${product.id}`) }, openGraph: { title: `${product.model} | MAIWEIDA`, description: product.description.slice(0, 170), type: "website", ...(product.image && absoluteUrl(product.image) ? { images: [{ url: absoluteUrl(product.image)!, alt: `Catalog family photograph for ${product.model}` }] } : {}) } };
}
export default async function ProductDetail({ params }: Props) {
  const { id } = await params, product = getProduct(id);
  if (!product) notFound();
  const schema = { "@context": "https://schema.org", "@type": "Product", name: product.model, model: product.model, description: product.description,
    ...(product.category ? { category: product.category } : {}),
    ...(product.image && absoluteUrl(product.image) ? { image: absoluteUrl(product.image) } : {}),
    ...(absoluteUrl(`/products/${product.id}`) ? { url: absoluteUrl(`/products/${product.id}`) } : {}) };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(schema) }} />
    <Container>
      <Breadcrumbs items={[{ label: "Products", href: "/products" }, ...(product.category ? [{ label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` }] : []), { label: product.model }]} />
      <section aria-label="Product enquiry" className="grid gap-9 pb-16 md:grid-cols-[1.2fr_1fr] lg:gap-16 lg:pb-24">
        <div className="min-w-0">
          <div className="border border-line"><ProductImage product={product} large /></div>
          <p className="mt-4 max-w-xl text-xs leading-6 text-muted">{product.image ? "Catalog family photograph. Confirm exact size, orientation and configuration before ordering." : "Placeholder illustration only; not a product photograph or dimensional drawing."}</p>
        </div>
        <div className="min-w-0 self-center border-t border-line py-8 md:border-t-0 md:py-12">
          <Eyebrow>{product.isFamilyReference ? "Family reference" : "Catalog model"}</Eyebrow>
          <p className="mt-7 text-xs font-medium text-muted">Model number</p>
          <h1 className="mt-3 break-anywhere text-4xl leading-tight lg:text-5xl">{product.model}</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted">{product.description}</p>
          <Link href={rfqHref(product.model)} className="button button-dark mt-9 w-full justify-between sm:w-auto">Request a Quote <Arrow /></Link>
          {product.needsReview && <p className="mt-5 max-w-md text-xs leading-6 text-muted">{product.isFamilyReference ? "This is a catalog family reference, not a verified individual SKU. Include the required configuration with your enquiry." : "Catalog reference details require confirmation before ordering."}</p>}
          <Link href="/products" className="category-link mt-8 inline-block text-xs underline underline-offset-4">Back to all products</Link>
        </div>
      </section>
    </Container>
  </>;
}
