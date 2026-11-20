import Link from "next/link";
import type { Product } from "@/lib/catalog-core";
import { END_MILL_FAMILIES } from "@/lib/end-mill-catalog";
import { ProductCard } from "./product-card";
import { Arrow, Breadcrumbs, Container, Eyebrow, PageIntro } from "./ui";

export function EndMillCatalog({ products }: { products: Product[] }) {
  const endMills = products.filter(product => product.endMill && END_MILL_FAMILIES.some(family => family.id === product.categoryId));
  const options = endMills.reduce((sum, product) => sum + product.endMill!.variants.length, 0);
  return <>
    <PageIntro label="MAIVIDA / Milling tools" title="Solid Carbide End Mills">
      <p>Square, ball nose, corner radius and aluminum end mills from Zhuzhou, China. Compare catalog dimensions, select a model and share your workpiece and machine details for application-based selection support.</p>
      <p className="mt-5 text-sm">{endMills.length} series · {options} catalog model / dimension combinations</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="#end-mill-series" className="button button-dark">Compare end mill series <Arrow /></Link>
        <Link href="/contact/" className="button button-outline">Request a Quote <Arrow diagonal /></Link>
      </div>
    </PageIntro>
    <Container>
      <Breadcrumbs items={[{ label: "Products", href: "/products/" }, { label: "Solid Carbide End Mills" }]} />
      <nav aria-label="End mill types" className="flex flex-wrap gap-3 border-b border-line pb-8">
        {END_MILL_FAMILIES.filter(family => endMills.some(product => product.categoryId === family.id)).map(family => <Link key={family.id} href={`#${family.id}`} className="button button-outline">{family.title}</Link>)}
      </nav>
      <div id="end-mill-series" className="scroll-mt-6">
        {END_MILL_FAMILIES.map(family => {
          const series = endMills.filter(product => product.categoryId === family.id);
          if (!series.length) return null;
          return <section key={family.id} id={family.id} aria-labelledby={`${family.id}-title`} className="scroll-mt-6 border-b border-line py-12 md:py-16">
            <Eyebrow>Geometry / {series.length} series</Eyebrow>
            <h2 id={`${family.id}-title`} className="mt-4 text-3xl md:text-4xl">{family.title}</h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">{family.description}</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {series.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>;
        })}
      </div>
      <section aria-labelledby="end-mill-selection" className="grid gap-9 py-12 md:py-16 lg:grid-cols-2">
        <div>
          <Eyebrow>Selection support</Eyebrow>
          <h2 id="end-mill-selection" className="mt-4 text-3xl">Choose an end mill by the job and the exact dimensions.</h2>
          <p className="mt-5 text-sm leading-7 text-muted">Start with the required geometry, then check cutting diameter D, radius R, flute length H, overall length L and shank diameter d. Each product page lists the catalog combinations; a range does not mean every intermediate size is available.</p>
          <p className="mt-4 text-sm leading-7 text-muted">Send the workpiece material and hardness, machining operation, machine interface, required dimensions and quantity. Grade, coating and cutting conditions need confirmation for the selected application.</p>
        </div>
        <div className="border border-line bg-paper p-6 md:p-8">
          <h3 className="text-xl">From catalog reference to a focused enquiry</h3>
          <ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-7 text-muted">
            <li>Open a series and compare its model and dimension table.</li>
            <li>Select the exact model and shank combination for your enquiry.</li>
            <li>Review any flagged source-code discrepancies before ordering.</li>
          </ol>
          <Link href="/contact/" className="button button-dark mt-6">Discuss your application <Arrow /></Link>
          <Link href="/products/#product-catalogs" className="mt-5 block text-sm underline decoration-silver underline-offset-4">View / download product catalogs</Link>
        </div>
      </section>
      <p className="border-t border-line py-6 text-xs leading-6 text-muted">Catalog photographs show a representative tool for each series. Exact appearance, dimensions and availability depend on the selected model. <Link href="/products/" className="underline underline-offset-4">Browse all cutting tools and toolholding</Link>.</p>
    </Container>
  </>;
}
