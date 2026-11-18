import type { ReactNode } from "react";

const shapes = {
  catalog: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  industry: <><path d="M3 21V10l6 3V8l6 3V3h5l1 18H3Z" /><path d="M7 17h1m4 0h1m4 0h1" /></>,
  about: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 21v-5h6v5M8 7h1m6 0h1M8 11h1m6 0h1" /></>,
  contact: <><path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1.5-6A8 8 0 1 1 21 11Z" /><path d="M8 10h8m-8 4h5" /></>,
  quote: <><path d="M9 4H5v17h14V4h-4" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M8 11h8m-8 4h5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  whatsapp: <><path d="M21 11.5a9 9 0 0 1-13.3 8L3 21l1.5-4.7A9 9 0 1 1 21 11.5Z" /><path d="m8 7-1 2c.7 3.2 2.8 5.3 6 6l2-1-2-2-1 1c-1.4-.6-2.4-1.6-3-3l1-1-2-2Z" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2.7-1.7 1.2-1.7 2.7M12 17h.01" /></>,
  turning: <><path d="M3 5h18M3 9h18M7 15l8-4 5 8H7v-4ZM11 19v2" /><circle cx="13" cy="15" r="1" /></>,
  milling: <><path d="M8 3h8v7l2 3v8H6v-8l2-3V3ZM8 7h8M7 15l10-3M7 20l10-3" /></>,
  boring: <><path d="M3 6h14v6H3V6ZM13 12v5h8v4h-8M7 6v6" /></>,
  drilling: <><path d="M9 3h6v6l2 3v5l-5 5-5-5v-5l2-3V3ZM9 7h6M8 13l8-3M8 18l8-3" /></>,
  insert: <><path d="m7 3 14 4-4 14L3 17 7 3Z" /><circle cx="12" cy="12" r="3" /></>,
  tooling: <><path d="M8 3h8l2 8h3v5h-6v5H9v-5H3v-5h3l2-8ZM6 11h12M9 16h6" /></>,
  accessories: <><path d="m8 3-5 5 3 3 5-5-3-3ZM10 8l11 11-2 2L8 10M15 3h6v6l-3-3-4 4" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof shapes;

// Decorative icons always accompany a visible or screen-reader label.
export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg data-icon={name} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={`size-4 shrink-0 ${className}`}>{shapes[name]}</svg>;
}

const categoryIcons: Record<string, IconName> = {
  "turning-tools": "turning", "milling-tools": "milling", "solid-carbide-end-mills": "milling", "boring-tools": "boring",
  "mining-construction-tools": "drilling", "drilling-tools": "drilling", "cnc-inserts": "insert", "tooling-systems": "tooling", accessories: "accessories",
};
export function categoryIcon(id: string): IconName { return categoryIcons[id] ?? "catalog"; }
