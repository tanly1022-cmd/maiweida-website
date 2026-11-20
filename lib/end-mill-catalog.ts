import type { Product } from "./catalog-core";

export const END_MILLS_PATH = "/solid-carbide-end-mills/";
export const END_MILLS_TITLE = "Solid Carbide End Mills";
export const END_MILLS_DESCRIPTION = "Compare solid carbide square, ball nose, corner radius and aluminum end mills from MAIVIDA. View catalog dimensions and request a quote from Zhuzhou, China.";

export const END_MILL_FAMILIES = [
  { id: "square-end-mills", title: "Square End Mills", description: "Square-end geometry for shoulders, side milling and slots. Compare the standard and extended series below by cutting diameter, flute length and shank size." },
  { id: "ball-nose-end-mills", title: "Ball Nose End Mills", description: "Ball-nose geometry for contoured surfaces and profile machining. Open a series to compare the catalog tip radius, cutting diameter and length combinations." },
  { id: "corner-radius-end-mills", title: "Corner Radius End Mills", description: "Corner-radius geometry for shoulders and profiles. Check the R dimension in the model table; radius options vary with the selected diameter and series." },
  { id: "aluminum-end-mills", title: "Aluminum End Mills", description: "The JNM-3P series uses three-flute square-end geometry for aluminum machining. Compare its listed dimensions and share your workpiece and machining conditions." },
] as const;

function range(values: number[]): string {
  const min = Math.min(...values), max = Math.max(...values);
  return min === max ? String(min) : `${min}–${max}`;
}

// These are the endpoints of listed dimensions, not a promise of every intermediate size.
export function endMillSummary(product: Product) {
  const variants = product.endMill?.variants;
  if (!variants?.length) return undefined;
  return {
    diameter: range(variants.map(v => v.diameter)),
    fluteLength: range(variants.map(v => v.fluteLength)),
    overallLength: range(variants.map(v => v.overallLength)),
    shankDiameter: range(variants.map(v => v.shankDiameter)),
    flutes: [...new Set(variants.map(v => v.flutes))].sort((a, b) => a - b).join("/"),
    options: variants.length,
  };
}

export function endMillHeading(product: Product): string {
  return `${product.model} Solid Carbide ${product.name || "End Mills"}`;
}
