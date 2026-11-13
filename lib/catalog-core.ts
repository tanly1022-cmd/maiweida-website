export type CategoryChild = { id: string; name: string };
export type Category = CategoryChild & { children: CategoryChild[] };
export type PopulatedCategory = CategoryChild & { count: number; children: (CategoryChild & { count: number })[] };
export type Spec = { label: string; value: string; unit?: string };
export type Product = {
  id: string; model: string; name?: string; category?: string; categoryParent?: string; categoryId?: string; categoryParentId?: string; description: string;
  material?: string; coating?: string; application?: string; specs: Spec[];
  image?: string; pdf?: string; needsReview: boolean; isFamilyReference: boolean;
};
export const DESCRIPTION_FALLBACK = "Specifications available upon request.";
const cjk = /[\u2e80-\u2fff\u3000-\u303f\u3040-\u30ff\u3100-\u312f\u3400-\u9fff\uf900-\ufaff\u{20000}-\u{323af}]/u;
export function englishValue(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim() || /^(TBD|N\/A|NA|null|undefined|unknown|-|—)$/i.test(value.trim()) || cjk.test(value)) return undefined;
  return value; // Source spelling, spacing, codes, grades and case are not rewritten.
}
export function localAsset(value: unknown, kind: "image" | "pdf"): string | undefined {
  const text = englishValue(value);
  const pattern = kind === "image" ? /^\/images\/[a-zA-Z0-9_./-]+\.(svg|png|jpg|jpeg|webp|avif)$/i : /^\/downloads\/[a-zA-Z0-9_./-]+\.pdf$/i;
  return text && pattern.test(text) && !text.includes("..") && !text.includes("//") ? text : undefined;
}
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export function normalizeCategories(raw: unknown): Category[] {
  if (!Array.isArray(raw)) throw new Error("categories.json must contain a two-level English category tree.");
  const ids = new Set<string>(), names = new Set<string>();
  function node(value: unknown): CategoryChild {
    const row = record(value), id = englishValue(row.id), name = englishValue(row.name);
    if (!id || !/^[a-z0-9-]+$/.test(id) || !name || ids.has(id) || names.has(name)) throw new Error("Invalid or duplicate category.");
    ids.add(id); names.add(name); return { id, name };
  }
  return raw.map(value => {
    const parent = node(value), children = record(value).children;
    if (!Array.isArray(children)) throw new Error("Category children must be an array.");
    return { ...parent, children: children.map(node) };
  });
}
export function populatedCategories(categories: Category[], products: Product[]): PopulatedCategory[] {
  return categories.map(parent => {
    const children = parent.children.map(child => ({ ...child, count: products.filter(p => p.categoryId === child.id).length })).filter(child => child.count > 0);
    return { ...parent, children, count: children.reduce((sum, child) => sum + child.count, 0) };
  }).filter(parent => parent.count > 0);
}
export function normalizeCatalog(raw: unknown, categories: Category[]): Product[] {
  if (!Array.isArray(raw)) throw new Error("products.json must contain an array.");
  const ids = new Set<string>();
  return raw.flatMap((entry): Product[] => {
    const row = record(entry);
    // Image-backed families may be browsed as references, never as verified SKU rows.
    const image = localAsset(row.image, "image");
    const realImage = image && !image.endsWith("/default-placeholder.svg") && image !== "/images/product-placeholder.svg" ? image : undefined;
    const isFamilyReference = row.status === "family_reference_only";
    if (!["needs_manual_review", "published", "approved"].includes(String(row.status)) && !(isFamilyReference && realImage)) return [];
    const id = englishValue(row.id), model = englishValue(row.model);
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id) || !model) return [];
    if (ids.has(id)) throw new Error(`Duplicate product ID: ${id}`);
    ids.add(id);
    const category = englishValue(row.category_en);
    const parent = categories.find(p => p.children.some(c => c.name === category));
    const child = parent?.children.find(c => c.name === category);
    const specs = Array.isArray(row.specs) ? row.specs.flatMap((item): Spec[] => {
      const spec = record(item), label = englishValue(spec.label_en), value = englishValue(spec.value);
      return label && value ? [{ label, value, ...(englishValue(spec.unit) ? { unit: englishValue(spec.unit) } : {}) }] : [];
    }) : [];
    // Explicit allowlist. Never spread source objects or their bilingual reference fields.
    return [{ id, model, name: englishValue(row.name_en),
      category: child?.name, categoryId: child?.id, categoryParent: parent?.name, categoryParentId: parent?.id,
      description: englishValue(row.description_en) ?? DESCRIPTION_FALLBACK,
      material: englishValue(row.material), coating: englishValue(row.coating),
      application: englishValue(row.application_en), specs,
      image: realImage, pdf: localAsset(row.pdf, "pdf"),
      needsReview: row.status === "needs_manual_review" || isFamilyReference, isFamilyReference }];
  });
}
export function filterProducts(products: Product[], query: string, category: string) {
  const words = query.toLocaleLowerCase("en").trim().split(/\s+/).filter(Boolean);
  return products.filter(p => (!category || p.category === category || p.categoryParent === category || p.categoryId === category || p.categoryParentId === category) && words.every(word =>
    [p.model, p.name, p.categoryParent, p.category, p.material, p.coating, p.application].filter(Boolean).join(" ").toLocaleLowerCase("en").includes(word)));
}
export function productTitle(product: Product) { return product.name ?? product.model; }
export function jsonLdString(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026"); }
