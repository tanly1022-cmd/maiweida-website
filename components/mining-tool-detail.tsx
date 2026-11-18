"use client";

import Link from "next/link";
import { useState } from "react";
import { miningAppearanceTitle, type Product } from "@/lib/catalog-core";
import { ProductImage } from "./product-card";
import { MiningToolOptions } from "./mining-tool-options";
import { MiningToolSpecifications } from "./mining-tool-specifications";
import { Eyebrow } from "./ui";

// Keep each source geometry intact: its own columns, models, warnings and drawing.
export function MiningToolDetail({ product, geometries }: { product: Product; geometries: Product[] }) {
  const [geometryId, setGeometryId] = useState(product.id);
  const [selectedModel, setSelectedModel] = useState("");
  const active = geometries.find(p => p.id === geometryId) ?? product;
  const title = miningAppearanceTitle(product);
  const optionCount = geometries.reduce((n, p) => n + (p.miningTool?.variants.length ?? 0), 0);
  return <>
    <section aria-label="Product enquiry" className="grid gap-9 pb-16 md:grid-cols-[1.2fr_1fr] lg:gap-16 lg:pb-24">
      <div className="min-w-0">
        <div className="border border-line"><ProductImage product={active} large /></div>
        <p className="mt-4 max-w-xl text-xs leading-6 text-muted">Catalog rendering, not a product photograph. Extracted at the original resolution without enlargement. Appearance and dimensions vary by selected model; refer to the corresponding dimension drawing and table.</p>
      </div>
      <div className="min-w-0 self-center border-t border-line py-8 md:border-t-0 md:py-12">
        <Eyebrow>Catalog appearance</Eyebrow>
        <h1 className="mt-7 break-anywhere text-4xl leading-tight lg:text-5xl">{title}</h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-muted">{geometries.length > 1 ? `One shared appearance, ${geometries.length} geometry options and ${optionCount} catalog models. Select an exact model to display its geometry, original drawing, dimension columns and reference grades.` : product.description}</p>
        {geometries.length > 1 && <div className="mt-7 border-t border-line pt-6">
          <label className="field-label" htmlFor="mining-geometry">Geometry / structure</label>
          <select id="mining-geometry" className="input w-full min-w-0" value={active.id} onChange={e => { setGeometryId(e.target.value); setSelectedModel(""); }}>
            {geometries.map(p => <option key={p.id} value={p.id}>{p.model} ({p.miningTool?.variants.length} models)</option>)}
          </select>
          <p className="mt-3 text-xs leading-6 text-muted">Changing geometry updates the drawing and dimension table, and clears the previous model selection. Selecting a model directly also switches to its geometry.</p>
        </div>}
        <MiningToolOptions key={active.id} product={active} geometries={geometries} selected={selectedModel} onSelect={id => {
          const match = geometries.find(p => p.miningTool?.variants.some(v => v.id === id));
          if (match) setGeometryId(match.id);
          setSelectedModel(id);
        }} />
        <Link href={`/products?category=${encodeURIComponent(product.categoryId ?? product.category ?? "")}#results`} className="category-link mt-8 inline-block text-xs underline underline-offset-4">Back to products</Link>
      </div>
    </section>
    <MiningToolSpecifications product={active} selectedVariantId={selectedModel} />
  </>;
}
