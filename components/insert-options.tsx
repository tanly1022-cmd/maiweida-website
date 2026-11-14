"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalog-core";
import { gradeLabel, insertEnquiryModel, recommendationLabels, recommendationSymbols } from "@/lib/insert-options";
import { rfqHref } from "@/lib/site";
import { Arrow } from "./ui";

export function InsertOptions({ product, variants }: { product: Product; variants: Product[] }) {
  const [grade, setGrade] = useState("");
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("grade");
    setGrade(requested && product.grades?.includes(requested) ? requested : "");
  }, [product.id, product.grades]);
  return <div className="mt-7 max-w-lg border-t border-line pt-6">
    <label htmlFor="insert-model" className="field-label">Model / size option</label>
    <select id="insert-model" className="input" value={product.id} onChange={event => window.location.assign(`/products/${event.target.value}`)}>
      {variants.map(variant => <option key={variant.id} value={variant.id}>{variant.model}</option>)}
    </select>
    <label htmlFor="insert-grade" className="field-label mt-5">Grade for {product.model}</label>
    <select id="insert-grade" className="input" value={grade} onChange={event => setGrade(event.target.value)} disabled={!product.grades?.length}>
      <option value="">{product.grades?.length ? "Select a grade" : "Confirm grade with enquiry"}</option>
      {product.grades?.map(value => <option key={value} value={value}>{gradeLabel(product, value)}</option>)}
    </select>
    <ul className="mt-4 flex flex-wrap gap-2 text-xs" aria-label="Model-specific grade recommendations">
      {product.gradeRecommendations?.map(item => <li key={item.grade} className="border border-line bg-paper px-3 py-2" title={recommendationLabels[item.recommendation]}><span aria-hidden="true">{recommendationSymbols[item.recommendation]}</span> {item.grade}<span className="sr-only"> - {recommendationLabels[item.recommendation]}</span></li>)}
    </ul>
    <p className="mt-3 text-xs leading-6 text-muted">● Main recommended / ◐ General / ○ Available to produce. Catalog recommendations are not a stock or delivery commitment.</p>
    <Link href={rfqHref(insertEnquiryModel(product, grade))} className="button button-dark mt-7 w-full justify-between sm:w-auto">Request a Quote <Arrow /></Link>
  </div>;
}
