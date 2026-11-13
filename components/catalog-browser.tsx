"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container, PageIntro, Arrow } from "./ui";
import { ProductCard } from "./product-card";
import { CategorySidebar } from "./category-sidebar";
import { filterProducts, englishValue, type Product, type PopulatedCategory } from "@/lib/catalog-core";

type Props = { products: Product[]; categories: PopulatedCategory[] };
const PAGE_SIZE = 24;

// Only normalized English public fields are passed here, never raw source rows.
export function CatalogBrowser(props: Props) {
  const params = useSearchParams();
  return <CatalogView {...props} params={params} />;
}

export function CatalogView({ products, categories, params = new URLSearchParams() }: Props & { params?: Pick<URLSearchParams, "get"> }) {
  const query = englishValue(params.get("q"))?.slice(0, 120) ?? "";
  const categoryParam = params.get("category") ?? "";
  const available = categories.flatMap(p => [p, ...p.children]);
  const category = available.find(c => c.name === categoryParam || c.id === categoryParam)?.name ?? "";
  const results = filterProducts(products, query, category);
  const maxPage = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(maxPage, Math.max(1, Math.trunc(Number(params.get("page")) || 1)));
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  function url(values: { category?: string; page?: number; q?: string }) {
    const search = new URLSearchParams(); const selected = values.category ?? category; const term = values.q ?? query;
    if (selected) search.set("category", selected); if (term) search.set("q", term); if (values.page && values.page > 1) search.set("page", String(values.page));
    return `/products${search.size ? `?${search}` : ""}#results`;
  }
  const pageNumbers = [...new Set([1, page - 1, page, page + 1, maxPage])].filter(n => n >= 1 && n <= maxPage).sort((a, b) => a - b);
  return <><PageIntro label="Model catalog" title="Find your starting point."><p>Search the available catalog references by model or application. Select a category to narrow the list, then enquire about the details that matter to your process.</p></PageIntro><Container className="py-10 md:py-14"><form action="/products#results" method="get" className="grid items-end gap-4 border-b border-line pb-8 md:grid-cols-[1fr_1fr_auto]"><div><label htmlFor="catalog-search" className="field-label">Search catalog</label><input id="catalog-search" name="q" type="search" key={query} defaultValue={query} maxLength={120} placeholder="Model, category or application" className="input" /></div><div><label htmlFor="category" className="field-label">Product category</label><select className="input" id="category" name="category" key={category} defaultValue={category}><option value="">All categories</option>{categories.map(parent => <optgroup key={parent.id} label={parent.name}><option value={parent.name}>All {parent.name} ({parent.count})</option>{parent.children.map(child => <option key={child.id} value={child.name}>{child.name} ({child.count})</option>)}</optgroup>)}</select></div><button type="submit" className="button button-dark">Apply filters <Arrow /></button></form><div className="mt-9 grid gap-9 lg:grid-cols-[260px_1fr]"><CategorySidebar categories={categories} selected={category} query={query} total={products.length} /><section id="results" aria-label="Product results" className="min-w-0 scroll-mt-6"><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl">{query ? `Results for “${query}”` : "Catalog references"}</h2><p className="mt-3 text-xs text-muted" role="status">{results.length ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, results.length)} of ${results.length} references` : "No model-level references found"}</p></div>{(category || query) && <Link href="/products#results" className="text-xs underline underline-offset-4">Clear filters</Link>}</div>{category && <p className="mb-5 inline-block max-w-full border border-line bg-paper px-3 py-2 text-[10px] break-anywhere">{category}</p>}{shown.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{shown.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="border border-line bg-paper px-7 py-14"><h3 className="text-xl">No matching models.</h3><p className="mt-4 max-w-lg text-sm leading-7 text-muted">Try a different model code or category. Some category references do not yet have model-level entries. You can send your requirement without selecting a model.</p><Link href="/contact" className="button button-dark mt-7">Enquire about a requirement <Arrow /></Link></div>}{maxPage > 1 && <nav aria-label="Catalog pagination" className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">{page > 1 ? <Link href={url({ page: page - 1 })} className="button button-outline">Previous</Link> : <span className="px-4 text-xs text-muted">Previous</span>}<ol className="flex flex-wrap items-center gap-1">{pageNumbers.map((n, i) => <li key={n} className="flex items-center">{i > 0 && n - pageNumbers[i - 1] > 1 && <span className="px-2 text-muted" aria-hidden="true">…</span>}<Link href={url({ page: n })} aria-label={`Page ${n}`} aria-current={page === n ? "page" : undefined} className={`flex h-10 min-w-10 items-center justify-center border px-2 text-xs ${page === n ? "border-steel bg-steel text-white" : "border-line hover:bg-paper"}`}>{n}</Link></li>)}</ol>{page < maxPage ? <Link href={url({ page: page + 1 })} className="button button-outline">Next</Link> : <span className="px-4 text-xs text-muted">Next</span>}</nav>}<p className="mt-8 border-t border-line pt-6 text-xs leading-6 text-muted">Reference data only. Confirm the complete configuration, dimensions and units before ordering. Missing material, coating and specification fields are not displayed.</p></section></div></Container></>;
}
