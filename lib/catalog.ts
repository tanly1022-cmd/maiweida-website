import "server-only";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { normalizeCatalog, normalizeCategories, populatedCategories } from "./catalog-core";
// Read on the server only, including private catalog image provenance. Never import raw source rows on the client.
const rawCategories: unknown = JSON.parse(readFileSync(join(process.cwd(), "data/categories.json"), "utf8").replace(/^\uFEFF/, ""));
const rawProducts: unknown = JSON.parse(readFileSync(join(process.cwd(), "data/products.json"), "utf8").replace(/^\uFEFF/, ""));
const rawEndMills: unknown = JSON.parse(readFileSync(join(process.cwd(), "data/end-mills.json"), "utf8"));
if (!Array.isArray(rawProducts) || !Array.isArray(rawEndMills)) throw new Error("Catalog sources must be arrays.");
export const categories = normalizeCategories(rawCategories);
export const products = normalizeCatalog([...rawProducts, ...rawEndMills], categories).map(product => ({
  ...product,
  image: product.image && existsSync(join(process.cwd(), "public", product.image)) ? product.image : undefined,
  drawing: product.drawing && existsSync(join(process.cwd(), "public", product.drawing)) ? product.drawing : undefined,
  pdf: product.pdf && existsSync(join(process.cwd(), "public", product.pdf)) ? product.pdf : undefined
})).filter(product => !product.isFamilyReference || !!product.image);
export const navigationCategories = populatedCategories(categories, products);
export const categoryCounts: Record<string, number> = Object.fromEntries(navigationCategories.flatMap(p => [[p.name, p.count], ...p.children.map(c => [c.name, c.count])]));
export function getProduct(id: string) { return products.find(p => p.id === id); }
export function getFeaturedProducts() {
  const seen = new Set<string>();
  return products.filter(p => { if (!p.category || seen.has(p.category)) return false; seen.add(p.category); return true; }).slice(0, 4);
}
