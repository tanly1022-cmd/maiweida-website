"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { gradeLabel } from "@/lib/insert-options";
import type { Product } from "@/lib/catalog-core";
import { Arrow } from "./ui";

export function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  return <div className={`product-image relative ${large ? "aspect-square" : "aspect-[4/3]"}`}>
    <Image src={product.image ?? (product.endMill ? product.drawing : undefined) ?? "/images/product-placeholder.svg"} alt={product.image ? (product.insertSeries ? `Catalog photograph of ${product.insertSeries} insert` : product.endMill ? `Catalog photograph of ${product.model} end mill; representative configuration` : `Catalog family photograph for ${product.model}; representative configuration`) : `Replaceable schematic placeholder for ${product.model}; not a product photograph`} fill sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"} className={product.endMill && product.image ? "object-scale-down p-7" : "object-contain p-7"} loading="lazy" unoptimized />
    {!product.image && <span className="absolute bottom-3 left-4 text-[9px] uppercase tracking-[.15em] text-muted">{product.endMill ? "Geometry schematic / not a photograph" : "Illustration / image placeholder"}</span>}
  </div>;
}

function variantLabel(product: Product) {
  const dimensions = product.specs.slice(0, 2).map(spec => `${spec.label}: ${spec.value}${spec.unit && spec.unit !== "TBD" ? ` ${spec.unit}` : ""}`);
  return [product.model, ...dimensions].join(" - ");
}

function GradeOptions({ product }: { product: Product }) {
  if (!product.grades?.length) return null;
  return <div className="mt-5 border-t border-line pt-5">
    <label htmlFor={`grade-options-${product.id}`} className="field-label">Grade options</label>
    <select id={`grade-options-${product.id}`} className="input" defaultValue="">
      <option value="">Select a grade</option>
      {product.grades.map(grade => <option key={grade} value={grade}>{grade}</option>)}
    </select>
  </div>;
}

export function ProductCard({ product, variants = [product] }: { product: Product; variants?: Product[] }) {
  if (product.endMill) return <EndMillCard product={product} />;
  if (product.insertFamily) return <InsertCard product={product} variants={variants} />;
  const grouped = variants.length > 1;
  const heading = grouped ? (product.name ?? product.model) : product.model;
  function handleVariantChange(event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value;
    if (id) window.location.assign(`/products/${id}`);
  }
  return <article className="product-card group flex min-w-0 flex-col border border-line bg-white">
    <Link href={`/products/${product.id}`} aria-label={`View ${heading}`} className="block border-b border-line"><ProductImage product={product} /></Link>
    <div className="flex flex-1 flex-col p-6">
      {product.isFamilyReference && <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted">Family reference</p>}
      {product.category && <p className="mb-3 break-anywhere text-[10px] font-semibold leading-4 tracking-[.08em] text-muted">{product.category}</p>}
      <h3 className="break-anywhere text-lg"><Link href={`/products/${product.id}`} className="hover:underline underline-offset-4">{heading}</Link></h3>
      {grouped ? <p className="mt-2 text-sm text-muted">{variants.length} model references share this product image.</p> : product.name && product.name !== product.category && <p className="mt-2 text-sm text-muted">{product.name}</p>}
      {grouped && <div className="mt-5 border-t border-line pt-5">
        <label htmlFor={`model-options-${product.id}`} className="field-label">Model / size option</label>
        <select id={`model-options-${product.id}`} className="input" defaultValue="" onChange={handleVariantChange}>
          <option value="">Select a model</option>
          {variants.map(variant => <option key={variant.id} value={variant.id}>{variantLabel(variant)}</option>)}
        </select>
      </div>}
      <GradeOptions product={product} />
      {(product.material || product.coating || product.application || product.grades?.length) && <dl className="mt-4 space-y-2 text-xs leading-5">
        {product.material && <div className="flex gap-3"><dt className="w-18 shrink-0 text-muted">Material</dt><dd>{product.material}</dd></div>}
        {product.coating && <div className="flex gap-3"><dt className="w-18 shrink-0 text-muted">Coating</dt><dd>{product.coating}</dd></div>}
        {product.grades?.length ? <div className="flex gap-3"><dt className="w-18 shrink-0 text-muted">Grades</dt><dd className="break-anywhere">{product.grades.join(" / ")}</dd></div> : null}
        {product.application && <div className="flex gap-3"><dt className="w-18 shrink-0 text-muted">Application</dt><dd className="line-clamp-2 break-anywhere">{product.application}</dd></div>}
      </dl>}
      <Link href={`/products/${product.id}`} className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-5 text-xs font-semibold text-steel" style={{ marginTop: "1.5rem" }}>View product <Arrow diagonal /></Link>
    </div>
  </article>;
}

function InsertCard({ product, variants }: { product: Product; variants: Product[] }) {
  const [modelId, setModelId] = useState(product.id);
  const [grade, setGrade] = useState("");
  const selected = variants.find(variant => variant.id === modelId) ?? product;
  return <article className="product-card group flex min-w-0 flex-col border border-line bg-white">
    <Link href={`/products/${selected.id}`} aria-label={`View ${product.insertSeries}`} className="block border-b border-line"><ProductImage product={selected} /></Link>
    <div className="flex flex-1 flex-col p-5 md:p-6">
      <p className="mb-3 text-[10px] font-semibold tracking-[.08em] text-muted">{product.category}</p>
      <h3 className="break-anywhere text-xl"><Link href={`/products/${selected.id}`} className="hover:underline underline-offset-4">{product.insertSeries}</Link></h3>
      <p className="mt-2 text-xs text-muted">{variants.length} {variants.length === 1 ? "model" : "model / size options"}</p>
      <div className="mt-5 border-t border-line pt-4">
        <label htmlFor={`model-options-${product.id}`} className="field-label">Model / size</label>
        <select id={`model-options-${product.id}`} className="input text-xs" value={selected.id} onChange={event => { setModelId(event.target.value); setGrade(""); }}>
          {variants.map(variant => <option key={variant.id} value={variant.id}>{variant.model}</option>)}
        </select>
      </div>
      <div className="mt-4">
        <label htmlFor={`grade-options-${product.id}`} className="field-label">Grade for this model</label>
        <select id={`grade-options-${product.id}`} className="input text-xs" value={grade} onChange={event => setGrade(event.target.value)} disabled={!selected.grades?.length}>
          <option value="">{selected.grades?.length ? "Select a grade" : "Confirm grade with enquiry"}</option>
          {selected.grades?.map(value => <option key={value} value={value}>{gradeLabel(selected, value)}</option>)}
        </select>
      </div>
      <dl aria-live="polite" className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-xs">
        {selected.specs.slice(0, 3).map(spec => <div key={spec.label}><dt className="text-muted">{spec.label}</dt><dd className="mt-1">{spec.value}{spec.unit ? ` ${spec.unit}` : ""}</dd></div>)}
      </dl>
      <Link href={`/products/${selected.id}${grade ? `?grade=${encodeURIComponent(grade)}` : ""}`} className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-5 text-xs font-semibold text-steel" style={{ marginTop: "1.25rem" }}>Specifications & enquiry <Arrow diagonal /></Link>
    </div>
  </article>;
}

function EndMillCard({ product }: { product: Product }) {
  const series = product.endMill!;
  const diameters = series.variants.map(v => v.diameter);
  return <article className="product-card flex min-w-0 flex-col border border-line bg-white">
    <Link href={`/products/${product.id}`} className="block border-b border-line" aria-label={`View ${product.model} ${product.name}`}><ProductImage product={product} /></Link>
    <div className="flex flex-1 flex-col p-6">
      <p className="text-[10px] font-semibold tracking-wider text-muted">{product.category}</p>
      <h3 className="mt-3 text-lg"><Link href={`/products/${product.id}`} className="hover:underline underline-offset-4">{product.model}</Link></h3>
      <p className="mt-2 text-sm text-muted">{series.length} · {series.geometry}</p>
      <dl className="mt-5 space-y-2 text-xs leading-6">
        <div><dt className="inline text-muted">Cutting diameter </dt><dd className="inline">{Math.min(...diameters)}–{Math.max(...diameters)} mm</dd></div>
        <div><dt className="inline text-muted">Catalog options </dt><dd className="inline">{series.variants.length} model / dimension combinations</dd></div>
      </dl>
      <Link href={`/products/${product.id}`} className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5 text-xs font-semibold text-steel">Select model & dimensions <Arrow diagonal /></Link>
    </div>
  </article>;
}
