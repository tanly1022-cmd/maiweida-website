"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog-core";
import { endMillDimensions, endMillEnquiry } from "@/lib/end-mills";
import { rfqHref } from "@/lib/site";
import { Arrow } from "./ui";

export function EndMillOptions({ product }: { product: Product }) {
  const [selected, setSelected] = useState("");
  const series = product.endMill;
  if (!series) return null;
  const variant = series.variants.find(v => v.id === selected);
  return <div className="mt-7 border-t border-line pt-6">
    <label className="field-label" htmlFor={`end-mill-model-${product.id}`}>Model / dimensions</label>
    <select className="input w-full min-w-0" id={`end-mill-model-${product.id}`} value={selected} onChange={e => setSelected(e.target.value)}>
      <option value="">Select one of {series.variants.length} catalog options</option>
      {series.variants.map(v => <option value={v.id} key={v.id}>{v.model} — D{v.diameter} / d{v.shankDiameter}{v.reviewRequired ? " (confirm source code)" : ""}</option>)}
    </select>
    <div aria-live="polite" aria-atomic="true" className="mt-4 text-sm leading-7">
      {variant ? <><p className="break-anywhere font-semibold">{variant.model}</p><p>{endMillDimensions(variant)}</p>
        {variant.reviewRequired && <p className="mt-3 border-l-2 border-steel pl-3 text-xs text-muted">Source discrepancy: {variant.reviewNote} This is a confirmation enquiry, not a verified ordering code.</p>}</> : <p className="text-muted">Select an exact model to include its dimensions in your enquiry.</p>}
    </div>
    {variant && <Link href={rfqHref(endMillEnquiry(variant))} className="button button-dark mt-6 w-full justify-between sm:w-auto">{variant.reviewRequired ? "Confirm this catalog option" : "Request a Quote"}<Arrow /></Link>}
    <p className="mt-4 text-xs leading-6 text-muted">Catalog dimensions in mm. Confirm coating, grade, suitability and availability with your workpiece and machining conditions; no stock or performance is implied.</p>
  </div>;
}
