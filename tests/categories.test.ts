import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { normalizeCatalog, normalizeCategories, populatedCategories, filterProducts } from "../lib/catalog-core";
import { CategorySidebar } from "../components/category-sidebar";
const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const source = read("data/products.json");
const manifest = read("category-mapping-manifest.json");
const categories = normalizeCategories(read("data/categories.json"));
const products = normalizeCatalog(source, categories);
const navigation = populatedCategories(categories, products);
test("taxonomy retains all seven requested parents in order and a two-level English tree", () => {
  assert.deepEqual(categories.map(p => p.name), ["Turning Tools", "Milling Tools", "Boring Tools", "Drilling Tools", "CNC Inserts", "Tooling Systems", "Accessories"]);
  assert.doesNotMatch(JSON.stringify(categories), /[\u3400-\u9fff]/u);
  assert.equal(categories[0].children.length, 14);
  assert.equal(categories[1].children.length, 10);
  for (const parent of categories) {
    assert.ok(parent.children.some(child => child.name === `Other ${parent.name}`));
    for (const child of parent.children) assert.ok(!("children" in child));
  }
});
function pythonJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(pythonJson).join(", ")}]`;
  if (value !== null && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${pythonJson(k)}: ${pythonJson(v)}`).join(", ")}}`;
  return JSON.stringify(value).replace(/[\u007f-\uffff]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
test("every source record has one valid child and every non-category field is preserved", () => {
  assert.equal(source.length, 1326);
  assert.equal(manifest.assignments.length, source.length);
  for (const row of source) {
    const parent = categories.find(p => p.name === row.category_parent_en);
    assert.ok(parent);
    assert.ok(parent.children.some(c => c.name === row.category_en && c.id === row.category_id));
    const assignment = manifest.assignments.find((a: {id: string}) => a.id === row.id);
    assert.ok(assignment?.preserved_fields_sha256);
    const retained = Object.fromEntries(Object.entries(row).filter(([key]) => !["category_en", "category_parent_en", "category_id"].includes(key)));
    assert.equal(createHash("sha256").update(pythonJson(retained)).digest("hex"), assignment.preserved_fields_sha256);

  }
});
test("source fields match the original extraction image manifest for every model and image", () => {
  const images = read("product-image-manifest.json");
  for (const assignment of images.assignments) {
    const row = source.find((p: {id: string}) => p.id === assignment.product_id);
    assert.equal(row.model, assignment.model);
    assert.equal(row.image, assignment.image);
  }
});
test("duplicate prefixes are disambiguated by saved catalog section rather than guessed globally", () => {
  assert.equal(products.find(p => p.id === "mwd-p006-family-01")?.category, "M style external turning toolholders");
  assert.equal(products.find(p => p.model === "MCLNR/L" && p.categoryParent === "Turning Tools" && p.id.startsWith("mwd-p031"))?.category, "M style internal turning toolholders");
  assert.equal(products.find(p => p.id === "mwd-p012-family-02")?.category, "P style external turning toolholders");
});
test("parent and child filters partition the visible catalog, with no empty navigation nodes", () => {
  assert.equal(navigation.reduce((sum, p) => sum + p.count, 0), products.length);
  assert.ok(!navigation.some(p => p.name === "CNC Inserts"));
  for (const parent of navigation) {
    assert.ok(parent.count > 0);
    assert.equal(parent.count, filterProducts(products, "", parent.name).length);
    assert.equal(parent.count, filterProducts(products, "", parent.id).length);
    for (const child of parent.children) {
      assert.ok(child.count > 0);
      assert.equal(child.count, filterProducts(products, "", child.name).length);
    }
  }
  assert.ok(filterProducts(products, "PCBNR/L", "Turning Tools").length > 0);
  assert.equal(filterProducts(products, "PCBNR/L", "Milling Tools").length, 0);
});
test("sidebar is collapsed by default, hides zero branches, preserves search, and resets page", () => {
  const html = renderToStaticMarkup(createElement(CategorySidebar, {categories: navigation, selected: "", query: "MCLNR/L", total: products.length}));
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, navigation.length);
  assert.doesNotMatch(html, /aria-expanded="true"/);
  assert.equal((html.match(/hidden=""/g) ?? []).length, navigation.length);
  assert.doesNotMatch(html, /CNC Inserts|Solid carbide end mills|Carbide drill bits/);
  assert.match(html, /q=MCLNR%2FL/);
  assert.doesNotMatch(html, /page=/);
});
