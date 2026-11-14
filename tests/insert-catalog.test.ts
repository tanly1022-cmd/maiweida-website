import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { normalizeCatalog, normalizeCategories, groupProducts, localAsset } from "../lib/catalog-core";
import { insertEnquiryModel, gradeLabel } from "../lib/insert-options";
import reference from "../data/insert-reference.json";
const read = (file: string) => JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
const raw = read("data/products.json");
const rows = raw.filter((row: {id: string}) => row.id.startsWith("mwd-insert-"));
const categories = normalizeCategories(read("data/categories.json"));
const inserts = normalizeCatalog(rows, categories);
const byModel = (model: string) => { const p = inserts.find(p => p.model === model); assert.ok(p, model); return p; };

test("reviewed insert import contains 537 unique models in 182 photographed groups", () => {
  assert.equal(raw.length - rows.length, 1326);
  assert.equal(rows.length, 537);
  assert.equal(inserts.length, 537);
  assert.equal(new Set(inserts.map(p => p.model)).size, 537);
  const groups = groupProducts(inserts);
  assert.equal(groups.length, 182);
  const expected = [["Turning inserts",315,100],["Milling inserts",88,49],["Threading inserts",29,9],["Parting and grooving inserts",13,3],["U drill inserts",16,3],["Aluminum inserts",27,5],["Deep-hole drilling inserts",49,13]] as const;
  for (const [category, models, photos] of expected) {
    assert.equal(inserts.filter(p => p.category === category).length, models);
    assert.equal(groups.filter(g => g.product.category === category).length, photos);
  }
  for (const group of groups) {
    assert.ok(group.product.image && group.product.drawing);
    assert.equal(new Set(group.variants.map(p => p.image)).size, 1);
    assert.equal(new Set(group.variants.map(p => p.insertFamily)).size, 1);
  }
  assert.notEqual(byModel("CNMG120404-PM4").insertFamily, byModel("CNMG120404-PM3").insertFamily);
});

test("all photos and drawings exist, while supplier PDF and branding stay private", () => {
  assert.equal(new Set(inserts.map(p => p.drawing)).size, 69);
  for (const p of inserts) {
    assert.ok(existsSync(join("public", p.image!)), p.model);
    assert.ok(existsSync(join("public", p.drawing!)), p.model);
    assert.ok(p.sourcePage && p.sourcePage >= 21 && p.sourcePage <= 122);
    assert.equal(p.pdf, undefined);
    assert.equal(p.material, undefined);
    assert.equal(p.coating, undefined);
  }
  assert.doesNotMatch(JSON.stringify(inserts), /jgcarbide|株洲精工|精工|https?:|@/i);
});

test("model-specific grades retain source symbols and blank cells without invented combinations", () => {
  const pm4 = byModel("CNMG120404-PM4");
  assert.deepEqual(pm4.gradeRecommendations, [
    {grade:"JGP15S",recommendation:"general"},{grade:"JGP15T",recommendation:"main"},
    {grade:"JGP25S",recommendation:"main"},{grade:"JGP25T",recommendation:"main"},
  ]);
  assert.equal(gradeLabel(pm4, "JGP15S"), "JGP15S - General");
  for (const model of ["TNMG160404-PF4","TNMG160412-PF4","TNGG160402R-S"]) {
    assert.deepEqual(byModel(model).grades, []);
    assert.deepEqual(byModel(model).gradeRecommendations, []);
  }
  for (const p of inserts.filter(p => p.category === "Aluminum inserts")) assert.deepEqual(p.grades,["JS10"]);
  for (const p of inserts) assert.deepEqual(p.gradeRecommendations?.map(g => g.grade), p.grades);
  assert.equal(insertEnquiryModel(pm4,"JGP25T"),"CNMG120404-PM4 / Grade: JGP25T");
  assert.equal(insertEnquiryModel(pm4,"JS10"),"CNMG120404-PM4");
});

test("grooving thickness, thread pitch and deep-hole model codes match reviewed source", () => {
  for (const p of inserts.filter(p => p.category === "Parting and grooving inserts")) {
    assert.ok(p.specs.some(s => s.label === "t"));
    assert.ok(!p.specs.some(s => s.label === "1"));
  }
  const ws = inserts.filter(p => p.category === "Threading inserts" && p.model.includes("WS"));
  assert.ok(ws.length);
  for (const p of ws) assert.equal(p.specs.find(s => s.label === "Pitch")?.unit, "TPI");
  const deep = inserts.filter(p => p.category === "Deep-hole drilling inserts");
  assert.equal(deep.filter(p => p.model.startsWith("TPMT")).length,4);
  assert.ok(deep.some(p => p.model.startsWith("R800.24")));
  assert.ok(!deep.some(p => p.model.startsWith("R900.24")));
});

test("normalization rejects unsafe assets and unsupported grade recommendations", () => {
  const [p] = normalizeCatalog([{...rows[0],drawing:"/images/../private.png",grade_recommendations:[
    {grade:rows[0].grades[0],recommendation:"invented"},{grade:"NOT-A-SOURCE-GRADE",recommendation:"main"},
  ]}],categories);
  assert.equal(p.drawing,undefined);
  assert.deepEqual(p.gradeRecommendations,[]);
  assert.equal(localAsset("/images//private.png","image"),undefined);
  assert.deepEqual(normalizeCatalog([{...rows[0],status:"hidden"}],categories),[]);
});

test("technical references retain comparison structure and flag anomalous source values", () => {
  assert.equal(reference.brands.length,9);
  assert.deepEqual(reference.comparisons.map(s => [s.operation,s.rows.length]),[["Turning",11],["Milling",11]]);
  for (const section of reference.comparisons) for (const row of section.rows) assert.equal(row.references.length,9);
  assert.equal(reference.hardness.rows.length,107);
  assert.equal(reference.hardness.rows[0].hrc,70);
  assert.equal(reference.hardness.rows[106].hrc,17);
  for (const row of reference.hardness.rows.filter(r => r.hrc >= 24.5 && r.hrc <= 32)) {
    assert.equal(row.requiresVerification,true);
    assert.equal(row.tensile,row.hb);
  }
  assert.equal(reference.hardness.rows.find(r => r.hrc === 51.5)?.requiresVerification,true);
});

test("local extraction manifest, when present, verifies every imported asset digest", () => {
  const path = "data/insert-catalog-manifest.json";
  if (!existsSync(path)) return; // Internal extraction evidence is intentionally ignored by Git.
  const manifest = read(path);
  assert.equal(manifest.modelCount,537);
  assert.equal(manifest.records.length,537);
  assert.equal(Object.keys(manifest.assets).length,251);
  for (const [name,asset] of Object.entries(manifest.assets)) {
    assert.equal(createHash("sha256").update(readFileSync(join("public/images/inserts",name))).digest("hex"),(asset as {sha256:string}).sha256);
  }
});
