"use client";
import Link from "next/link";
import { useState } from "react";
import type { PopulatedCategory } from "@/lib/catalog-core";
export function CategorySidebar({ categories, selected, query, total }: { categories: PopulatedCategory[]; selected: string; query: string; total: number }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  function href(category: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    return `/products${params.size ? `?${params}` : ""}#results`;
  }
  return <aside aria-label="Catalog categories" className="min-w-0">
    <h2 className="eyebrow mb-4 text-muted">Categories</h2>
    <Link href={href("")} aria-current={!selected ? "page" : undefined} className={`category-link mb-3 flex justify-between border-b border-line py-3 text-xs ${!selected ? "category-active font-semibold" : ""}`}>All model references <span className="font-mono">{total}</span></Link>
    <nav aria-label="Product category tree">
      {categories.map(parent => {
        const active = selected === parent.name || parent.children.some(child => child.name === selected);
        const open = !!expanded[parent.id];
        return <div key={parent.id} className="border-b border-line">
          <div className={`flex items-center gap-2 text-sm ${active ? "category-active" : "text-steel"}`}>
            <Link href={href(parent.name)} aria-current={selected === parent.name ? "page" : undefined} className="category-link min-w-0 flex-1 py-4 font-medium">{parent.name}</Link>
            <span className="text-[10px] text-muted" aria-hidden="true">{parent.count}</span>
            <button type="button" aria-label={`${open ? "Collapse" : "Expand"} ${parent.name}`} aria-expanded={open} aria-controls={`children-${parent.id}`} onClick={() => setExpanded(current => ({ ...current, [parent.id]: !current[parent.id] }))} className="category-link flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
              <svg className={`h-4 w-4 ${open ? "rotate-90" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </div>
          <ul id={`children-${parent.id}`} hidden={!open} className="mb-4 border-l border-line">
            {parent.children.map(child => <li key={child.id}><Link href={href(child.name)} aria-current={selected === child.name ? "page" : undefined} className={`category-link flex items-start justify-between gap-3 border-l-2 px-3 py-3 text-xs leading-5 ${selected === child.name ? "category-active border-orange bg-paper font-semibold" : "border-transparent text-muted"}`}><span>{child.name}</span><span className="shrink-0 font-mono text-[10px]">{child.count}</span></Link></li>)}
          </ul>
        </div>;
      })}
    </nav>
  </aside>;
}
