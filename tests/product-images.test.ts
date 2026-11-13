import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { normalizeCatalog, normalizeCategories, DESCRIPTION_FALLBACK } from "../lib/catalog-core";
const read = (file: string) => JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
const source = read("data/products.json");
const manifest = read("product-image-manifest.json");
const categories = normalizeCategories(read("data/categories.json"));
const products = normalizeCatalog(source, categories);
test("all assigned catalog images exist and match the extraction manifest", () => {
  assert.equal(manifest.products_total, source.length);
  assert.equal(manifest.assignments.length + manifest.unresolved.length, source.length);
  for (const [name, asset] of Object.entries(manifest.assets)) {
    const bytes = readFileSync(join("public/images/products", name));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), (asset as {sha256: string}).sha256);
  }
  for (const row of source) assert.ok(existsSync(join("public", row.image)), row.id);
  for (const assignment of manifest.assignments) {
    const row = source.find((p: {id: string}) => p.id === assignment.product_id);
    assert.equal(row.image, assignment.image);
    assert.equal(row.model, assignment.model);
  }
});
test("named catalog families use their own photographs and retain reference status", () => {
  for (const [id, image] of [["mwd-p012-family-01", "MRGNR_L"], ["mwd-p012-family-02", "PCBNR_L"]]) {
    const product = products.find(p => p.id === id);
    assert.ok(product);
    assert.equal(product.image, `/images/products/${image}.jpg`);
    assert.equal(product.isFamilyReference, true);
    assert.equal(product.needsReview, true);
    assert.equal(source.find((p: {id: string}) => p.id === id).status, "family_reference_only");
  }
});
test("placeholder families are excluded; unresolved SKU rows have honest fallback images", () => {
  for (const row of source.filter((p: {image: string}) => p.image.endsWith("default-placeholder.svg"))) {
    const product = products.find(p => p.id === row.id);
    if (row.status === "family_reference_only") assert.equal(product, undefined);
    if (product) assert.equal(product.image, undefined);
  }
});
test("private bilingual references are never exposed, and missing descriptions use the agreed fallback", () => {
  assert.doesNotMatch(JSON.stringify(products), /[\u3400-\u9fff]/u);
  for (const p of products) {
    assert.ok(!("name_zh_ref" in p));
    const row = source.find((r: {id: string}) => r.id === p.id);
    if (!row.description_en || row.description_en === "TBD") assert.equal(p.description, DESCRIPTION_FALLBACK);
  }
});
