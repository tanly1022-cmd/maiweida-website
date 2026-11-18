"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog-core";
import { miningDimensions, miningEnquiry } from "@/lib/mining-tools";
import { rfqHref } from "@/lib/site";
import { Arrow } from "./ui";

export function MiningToolOptions({ product, geometries = [product], selected: controlledSelected, onSelect }: { product: Product; geometries?: Product[]; selected?: string; onSelect?: (id: string) => void }) {
  const [localSelected, setLocalSelected] = useState("");
  const selected = controlledSelected ?? localSelected;
  function select(id: string) { setLocalSelected(id); onSelect?.(id); }
  const series = product.miningTool;
  if (!series) return null;
  const variant = series.variants.find(v => v.id === selected);
  return <div className="mt-7 border-t border-line pt-6">
    <label className="field-label" htmlFor={`mining-model-${product.id}`}>Model / dimensions</label>
    <select className="input w-full min-w-0" id={`mining-model-${product.id}`} value={selected} onChange={e => select(e.target.value)}>
      <option value="">Select one of {geometries.reduce((n, p) => n + (p.miningTool?.variants.length ?? 0), 0)} catalog options</option>
      {geometries.length > 1 ? geometries.map(p => <optgroup key={p.id} label={p.model}>
        {p.miningTool?.variants.map(v => <option value={v.id} key={v.id}>{v.model}{v.reviewRequired ? " (confirmation required)" : ""}</option>)}
      </optgroup>) : series.variants.map(v => <option value={v.id} key={v.id}>{v.model}{v.reviewRequired ? " (confirmation required)" : ""}</option>)}
    </select>
    <div aria-live="polite" aria-atomic="true" className="mt-4 text-sm leading-7">
      {variant ? <><p className="break-anywhere font-semibold">{variant.model}</p><p className="break-anywhere">{miningDimensions(series, variant)}</p>
        {variant.reviewRequired && <p className="mt-3 border-l-2 border-steel pl-3 text-xs text-muted">Source discrepancy: {variant.reviewNote}</p>}</> : <p className="text-muted">Select an exact model to include its catalog dimensions in your enquiry.</p>}
    </div>
    {series.sourceNote && <p className="mt-4 border-l-2 border-steel pl-3 text-xs leading-6 text-muted">Source clarification: {series.sourceNote}</p>}
    {variant && <Link href={rfqHref(miningEnquiry(series, variant))} className="button button-dark mt-6 w-full justify-between sm:w-auto">{variant.reviewRequired || series.sourceNote ? "Confirm this catalog option" : "Request a Quote"}<Arrow /></Link>}
    {!!series.referenceGrades.length && <div className="mt-6 border-t border-line pt-5">
      <p className="field-label">Section reference grades</p>
      <p className="break-anywhere text-xs leading-6">{series.referenceGrades.join(" / ")}</p>
      <p className="mt-2 text-xs leading-6 text-muted">These grades are listed for the catalog section, not assigned to each model. Confirm the suitable grade, fit and availability with your application.</p>
    </div>}
  </div>;
}
