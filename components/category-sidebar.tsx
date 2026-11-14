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
    <div className="bg-steel px-5 py-7 text-white">
      <span className="mb-4 block h-0.5 w-6 bg-orange" aria-hidden="true" />
      <h2 className="text-xl font-semibold">Products</h2>
    </div>
    <Link href={href("")} aria-current={!selected ? "page" : undefined} className={`category-link flex items-center justify-between gap-3 border-b border-line px-4 py-4 text-xs ${!selected ? "category-active font-semibold" : ""}`}>All model references <span className="font-mono text-[10px]">{total}</span></Link>
    <nav aria-label="Product category tree">
      {categories.map(parent => {
        const active = selected === parent.name || parent.children.some(child => child.name === selected);
        const open = expanded[parent.id] ?? active;
        return <div key={parent.id} className="border-b border-line">
          <div className={`flex items-center text-sm ${active ? "category-active" : "text-steel"}`}>
            <Link href={href(parent.name)} aria-current={selected === parent.name ? "page" : undefined} className="category-link min-w-0 flex-1 px-4 py-4 font-medium">{parent.name}</Link>
            <span className="text-[10px] text-muted">{parent.count || "Catalog pending"}</span>
            {parent.children.length > 0 ? <button type="button" aria-label={`${open ? "Collapse" : "Expand"} ${parent.name}`} aria-expanded={open} aria-controls={`children-${parent.id}`} onClick={() => setExpanded(current => ({ ...current, [parent.id]: !open }))} className="category-link ml-3 flex h-12 w-11 shrink-0 cursor-pointer items-center justify-center border-l border-line">
              <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button> : <span className="ml-3 w-11 shrink-0" aria-hidden="true" />}
          </div>
          {parent.children.length > 0 && <ul id={`children-${parent.id}`} hidden={!open} className="bg-paper">
            {parent.children.map(child => <li key={child.id} className="border-t border-line"><Link href={href(child.name)} aria-current={selected === child.name ? "page" : undefined} className={`category-link flex items-center justify-between gap-3 border-l-2 px-5 py-4 text-xs leading-5 ${selected === child.name ? "category-active border-orange bg-white font-semibold" : "border-transparent text-muted"}`}><span>{child.name}</span>{child.count ? <span className="shrink-0 font-mono text-[10px]">{child.count}</span> : <span className="shrink-0 text-[9px] text-muted">Catalog pending</span>}</Link></li>)}
          </ul>}
        </div>;
      })}
    </nav>
  </aside>;
}
