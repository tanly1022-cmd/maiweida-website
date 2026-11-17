import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { normalizeCatalog, normalizeCategories, filterProducts, groupProducts } from "../lib/catalog-core";
import { endMillDimensions, endMillEnquiry, normalizeEndMill } from "../lib/end-mills";
import { EndMillSpecifications } from "../components/end-mill-specifications";
import { EndMillOptions } from "../components/end-mill-options";
import { ProductCard, ProductImage } from "../components/product-card";
import { rfqHref } from "../lib/site";
const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const raw = read("data/end-mills.json");
const products = normalizeCatalog(raw, normalizeCategories(read("data/categories.json")));
const all = products.flatMap(p => p.endMill!.variants);
test("17 series retain all 313 transcribed catalog combinations under four children", () => {
  assert.equal(products.length, 17); assert.equal(all.length, 313);
  const counts = Object.fromEntries(["Square End Mills", "Ball Nose End Mills", "Corner Radius End Mills", "Aluminum End Mills"].map(name => [name, products.filter(p => p.category === name).length]));
  assert.deepEqual(Object.values(counts), [6, 5, 5, 1]);
  for (const p of products) {
    assert.equal(p.categoryParent, "Solid Carbide End Mills");
    assert.ok(existsSync(`public${p.drawing}`));
    assert.equal(p.image, `/images/end-mills/${p.model.toLowerCase()}.png`);
    assert.ok(existsSync(`public${p.image}`));
    assert.equal(p.endMill!.variants.length, raw.find((r: {id: string}) => r.id === p.id).end_mill.variants.length);
  }
});
test("source discrepancies are preserved and flagged rather than silently corrected", () => {
  assert.equal(all.filter(v => v.reviewRequired).length, 5);
  for (const model of ["JGM-2BL-R2.0M--75", "JHM-4P-D2.0R0.2M-50", "JHM-2B-R0.2M-50", "JHM-2B-R0.5M-50", "JHM-2BL-R2.75M-75"]) {
    const v = all.find(v => v.model === model); assert.ok(v?.reviewRequired, model); assert.ok(v.reviewNote);
  }
});
test("full model search finds its series and photograph cards retain separate series", () => {
  for (const p of products) for (const v of p.endMill!.variants) assert.ok(filterProducts(products, v.model, "solid-carbide-end-mills").some(found => found.id === p.id));
  assert.equal(groupProducts(products).length, 17);
  for (const product of products) {
    const html = renderToStaticMarkup(createElement(ProductCard, { product }));
    assert.ok(html.includes(`src="${product.image}"`));
    assert.match(html, /Catalog photograph of/); assert.match(html, /object-scale-down/);
    assert.doesNotMatch(html, /not a photograph|image placeholder/); assert.match(html, /Select model/);
  }
});
test("every photo retains the native catalog pixels and the correct printed-page mapping", () => {
  const pages: Record<string, number> = {
    "JGM-4P": 127, "JGM-4PL": 128, "JGM-4R": 129, "JGM-4RL": 130, "JGM-2B": 131, "JGM-2BL": 132,
    "JPM-4P": 133, "JPM-4PL": 134, "JPM-4R": 135, "JPM-4RL": 136, "JPM-2B": 137,
    "JHM-4P": 138, "JHM-4PL": 140, "JHM-4R": 141, "JHM-2B": 142, "JHM-2BL": 144, "JNM-3P": 145,
  };
  for (const row of raw) {
    const source = row.source_reference.image;
    assert.equal(source.printedPage, pages[row.model]);
    assert.equal(source.pdfPage, Math.ceil(source.printedPage / 2) + 1);
    assert.ok(row.source_reference.printedPages.includes(source.printedPage));
    const bytes = readFileSync(`public${row.image}`);
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(bytes.readUInt32BE(16), source.width); assert.equal(bytes.readUInt32BE(20), source.height);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
    assert.ok(source.height >= 186 && source.height <= 200);
    const detail = renderToStaticMarkup(createElement(ProductImage, { product: products.find(p => p.id === row.id)!, large: true }));
    assert.match(detail, /object-scale-down/);
  }
});
test("missing photos still use an honestly labeled geometry schematic", () => {
  const product = { ...products[0], image: undefined };
  const html = renderToStaticMarkup(createElement(ProductImage, { product }));
  assert.match(html, /Geometry schematic \/ not a photograph/);
  assert.ok(html.includes(`src="${product.drawing}"`));
});
test("dimensional rows and RFQs reflect exact model and selected shank, not inferred sizes", () => {
  for (const p of products) for (const v of p.endMill!.variants) {
    assert.ok(v.fluteLength <= v.overallLength);
    if (p.endMill!.geometry === "Ball Nose") assert.equal(v.radius! * 2, v.diameter);
    const enquiry = endMillEnquiry(v);
    assert.ok(enquiry.includes(v.model)); assert.ok(enquiry.includes(`d ${v.shankDiameter}`));
    assert.ok(enquiry.includes(endMillDimensions(v))); assert.ok(enquiry.length <= 200);
    assert.equal(new URL(rfqHref(enquiry), "http://localhost").searchParams.get("model"), enquiry);
  }
});
test("flute length uses catalog H notation in specifications and enquiries", () => {
  for (const product of products) {
    const table = renderToStaticMarkup(createElement(EndMillSpecifications, { product }));
    assert.match(table, /H = flute length;/);
    assert.match(table, />H \(mm\)<\/th>/);
    assert.doesNotMatch(table, />l \(mm\)<\/th>/);
    for (const variant of product.endMill!.variants) {
      assert.ok(endMillDimensions(variant).includes(`/ H ${variant.fluteLength} / L ${variant.overallLength}`));
      assert.ok(endMillEnquiry(variant).includes(`/ H ${variant.fluteLength} / L ${variant.overallLength}`));
    }
  }
});
test("all models render server-side; selector requires explicit selection; private provenance never crosses boundary", () => {
  for (const product of products) {
    const table = renderToStaticMarkup(createElement(EndMillSpecifications, { product }));
    for (const v of product.endMill!.variants) assert.ok(table.includes(v.model));
    assert.match(table, /overflow-x-auto/);
  }
  const html = renderToStaticMarkup(createElement(EndMillOptions, { product: products[0] }));
  assert.match(html, /Select one of/); assert.doesNotMatch(html, /href="\/contact/);
  assert.doesNotMatch(JSON.stringify(products), /sourcePdfPage|sourceRow|source_reference|suitability|reviewMethod|sourcePrintedPage|objectIndex|sha256/);
});
test("malformed or malicious dimensions and private fields are not accepted", () => {
  const source = structuredClone(raw[0].end_mill);
  source.variants[0].diameter = -1;
  source.variants[1].model = "错误";
  assert.equal(normalizeEndMill(source)?.variants.length, source.variants.length - 2);
  assert.equal(normalizeEndMill({ ...source, variants: [] }), undefined);
});