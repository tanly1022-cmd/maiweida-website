import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { normalizeCatalog, normalizeCategories, populatedCategories } from "../lib/catalog-core";
const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const tree = normalizeCategories(read("data/categories.json"));
const rows = [...read("data/products.json"), ...read("data/end-mills.json")];
const products = normalizeCatalog(rows, tree);
for (const row of rows) {
  const parent = tree.find(p => p.name === row.category_parent_en);
  assert.ok(parent?.children.some(c => c.id === row.category_id && c.name === row.category_en), `Invalid category: ${row.id}`);
  if (row.drawing) assert.ok(existsSync(join("public", row.drawing)), `Missing drawing: ${row.id}`);
  if (row.end_mill) assert.equal(products.find(p => p.id === row.id)?.endMill?.variants.length, row.end_mill.variants.length, `Invalid variant: ${row.id}`);
  if (row.image) assert.ok(existsSync(join("public", row.image)), `Missing image: ${row.id}`);
}
assert.ok(products.every(p => p.categoryId));
assert.doesNotMatch(JSON.stringify(products), /[\u3400-\u9fff]/u);
console.log(`${rows.length} source records; ${products.length} browsable references; ${populatedCategories(tree, products).length} populated parents.`);
