import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { normalizeMiningTool, miningDimensions, miningEnquiry } from "../lib/mining-tools";
import { normalizeCatalog, normalizeCategories, filterProducts, groupProducts, miningAppearanceProducts, miningAppearanceTitle, populatedCategories } from "../lib/catalog-core";
import { MiningToolOptions } from "../components/mining-tool-options";
import { MiningToolSpecifications } from "../components/mining-tool-specifications";
import { MiningToolDetail } from "../components/mining-tool-detail";
import { ProductCard } from "../components/product-card";
import { rfqHref } from "../lib/site";
const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const raw = read("data/mining-tools.json");
const categories = normalizeCategories(read("data/categories.json"));
const products = normalizeCatalog(raw, categories);
const render = renderToStaticMarkup;

test("mining import retains 23 series, 154 options and all 46 local assets", () => {
  assert.equal(products.length, 23);
  assert.equal(products.reduce((n, p) => n + p.miningTool!.variants.length, 0), 154);
  const expected = [["mining-carbide-buttons", 9, 93], ["construction-coal-mining-buttons", 6, 23], ["oilfield-carbide-buttons", 5, 26], ["pdc-substrates", 3, 12]] as const;
  for (const [id, series, variants] of expected) {
    const subset = products.filter(p => p.categoryId === id);
    assert.equal(subset.length, series);
    assert.equal(subset.reduce((n, p) => n + p.miningTool!.variants.length, 0), variants);
  }
  const assets = new Set<string>();
  products.forEach((p, i) => {
    assert.equal(p.miningTool!.variants.length, raw[i].mining_tool.variants.length);
    assert.deepEqual(p.miningTool!.variants.map(v => [v.model, v.values]), raw[i].mining_tool.variants.map((v: {model: string; values: string[]}) => [v.model, v.values]));
    for (const path of [p.image, p.drawing]) { assert.ok(path); assert.ok(existsSync(`public${path}`)); assets.add(path); }
    assert.deepEqual(p.grades, []); // Section grades must not become per-model grades.
  });
  assert.equal(assets.size, 46);
});

test("catalog discrepancies and drawing/table symbols are preserved, never silently fixed", () => {
  const variants = products.flatMap(p => p.miningTool!.variants);
  const sourceHeight = variants.find(v => v.model === "SD161823-X28-JG")!;
  assert.equal(sourceHeight.values[1], "8.2"); assert.equal(sourceHeight.reviewRequired, true);
  for (const [model, values] of [["ZF16178010-7.0", ["11.2", "3.5"]], ["ZF16173015-7.5", ["14.4", "4.0"]]] as const) {
    const v = variants.find(v => v.model === model)!;
    assert.deepEqual(v.values, values); assert.equal(v.reviewRequired, true); assert.ok(v.reviewNote);
  }
  assert.ok(products.find(p => p.id === "mining-mushroom")!.miningTool!.variants.every(v => v.reviewRequired));
  const rolling = products.find(p => p.id === "mining-rolling")!.miningTool!;
  assert.deepEqual(rolling.columns.map(c => c.label), ["D", "d", "h", "e", "\u03b8", "\u03b1"]);
  assert.ok(rolling.sourceNote);
});

test("exact model search preserves punctuation and shared codes across applications", () => {
  for (const model of ["SQ0802096-E12E05", "SZ11217TZ-E15Q-JQ", "SZ11218TZ-E15Q-JQ", "SZ1427-SR2-82\u00b0"]) {
    assert.ok(filterProducts(products, model, "").some(p => p.miningTool!.variants.some(v => v.model === model)));
  }
  for (const model of ["SZ1300245-G09", "SZ1600290-G07Q"]) assert.equal(filterProducts(products, model, "").length, 2);
});

test("every enquiry carries the complete model and dimensions within the contact limit", () => {
  for (const p of products) for (const v of p.miningTool!.variants) {
    const message = miningEnquiry(p.miningTool!, v);
    assert.ok(message.startsWith(`${v.model} | `));
    assert.ok(message.includes(miningDimensions(p.miningTool!, v)));
    assert.ok(message.length <= 200, message);
    assert.equal(new URL(rfqHref(message), "https://maivida.com").searchParams.get("model"), message);
    assert.equal(message.includes("TO CONFIRM"), v.reviewRequired || !!p.miningTool!.sourceNote);
  }
});

test("mining normalization is an allowlist and rejects malformed data", () => {
  const input = structuredClone(raw[0].mining_tool);
  input.pdfPath = "F:/private.pdf"; input.ocr = "private extraction";
  input.variants[0].privatePath = "D:/private";
  const output = normalizeMiningTool(input)!;
  assert.doesNotMatch(JSON.stringify(output), /private|pdfPath|ocr/);
  assert.equal(normalizeMiningTool({ ...input, columns: [{ label: "D", unit: "inch" }] }), undefined);
  const bad = structuredClone(input);
  bad.variants = [{ ...input.variants[0], values: input.columns.map(() => "NaN") }];
  assert.equal(normalizeMiningTool(bad), undefined);
  bad.variants = [{ ...input.variants[0], reviewRequired: true, reviewNote: "" }];
  assert.equal(normalizeMiningTool(bad), undefined);
  bad.variants = [input.variants[0], input.variants[0]];
  assert.equal(normalizeMiningTool(bad)!.variants.length, 1);
  assert.equal(normalizeCatalog([{...raw[0], image: "/images/../private.jpg"}], categories)[0].image, undefined);
});

test("rendering labels, deliberate selection, source caveats and all table rows remain visible", () => {
  for (const p of products) {
    const options = render(createElement(MiningToolOptions, { product: p }));
    assert.match(options, /value="" selected=""/);
    assert.match(options, /not assigned to each model/);
    assert.doesNotMatch(options, /href="\/contact/); // No unselected default model enquiry.
    const table = render(createElement(MiningToolSpecifications, { product: p }));
    assert.equal((table.match(/scope="row"/g) ?? []).length, p.miningTool!.variants.length);
    assert.match(table, /overflow-x-auto/);
    const card = render(createElement(ProductCard, { product: p }));
    assert.match(card, /Catalog rendering/);
    assert.match(card, /not a photograph/);
    assert.doesNotMatch(card, /\?\d+(\.\d+)? mm/);
  }
});


test("reviewed shared appearances form 17 cards without losing any geometry or model", () => {
  const groups = groupProducts(products);
  assert.equal(groups.length, 17);
  assert.equal(groups.flatMap(g => g.variants).length, 23);
  assert.equal(groups.flatMap(g => g.variants).reduce((n, p) => n + p.miningTool!.variants.length, 0), 154);
  for (const [slug, title, models] of [["spherical", "Spherical buttons", 34], ["conical", "Conical buttons", 32], ["parabolic", "Parabolic buttons", 27]] as const) {
    const group = groups.find(g => g.product.id === `mining-${slug}-01`)!;
    assert.equal(group.variants.length, 3);
    assert.equal(miningAppearanceTitle(group.product), title);
    assert.equal(group.variants.reduce((n, p) => n + p.miningTool!.variants.length, 0), models);
    const html = render(createElement(ProductCard, { product: group.product, variants: group.variants }));
    assert.match(html, new RegExp(`${models} model / dimension combinations`));
    assert.match(html, /3 geometries in one appearance/);
    assert.equal((html.match(/<img /g) ?? []).length, 1);
    for (const geometry of group.variants) {
      assert.deepEqual(miningAppearanceProducts(geometry, products).map(p => p.id), group.variants.map(p => p.id));
      const detail = render(createElement(MiningToolDetail, { product: geometry, geometries: group.variants }));
      assert.match(detail, new RegExp(`>${title}</h1>`));
      assert.ok(detail.includes(geometry.drawing!));
      assert.equal((detail.match(/scope="row"/g) ?? []).length, geometry.miningTool!.variants.length);
      for (const p of group.variants) for (const v of p.miningTool!.variants) assert.ok(detail.includes(v.model));
      assert.doesNotMatch(detail, /href="\/contact/); // No implicit model enquiry.
    }
  }
  assert.deepEqual(populatedCategories(categories, products)[0].children.map(c => c.count), [3, 6, 5, 3]);
  assert.equal(populatedCategories(categories, products)[0].count, 17);
});

test("different appearances and applications are not merged by broad category or model text", () => {
  for (const p of products.filter(p => !p.miningTool!.appearanceId)) assert.deepEqual(miningAppearanceProducts(p, products), [p]);
  const first = products[0];
  const otherCategory = { ...first, id: "other-category", categoryId: "oilfield-carbide-buttons" };
  const noImage = { ...first, id: "no-image", image: undefined };
  assert.equal(groupProducts([first, otherCategory, noImage]).length, 3);
  assert.deepEqual(miningAppearanceProducts(first, [first, otherCategory, noImage]), [first]);
  const input = { ...raw[0].mining_tool, appearanceId: "../unsafe", appearanceName: "Spherical buttons" };
  assert.equal(normalizeMiningTool(input)!.appearanceId, undefined);
});

test("model search keeps geometry-specific results and table highlighting uses the selected row", () => {
  const geometry = products.find(p => p.id === "mining-spherical-03")!;
  const model = geometry.miningTool!.variants[0];
  const results = filterProducts(products, model.model, "mining-carbide-buttons");
  assert.ok(results.some(p => p.id === geometry.id));
  assert.equal(groupProducts(results).length, 1);
  const family = miningAppearanceProducts(geometry, products);
  const options = render(createElement(MiningToolOptions, { product: geometry, geometries: family, selected: model.id }));
  assert.equal((options.match(/<optgroup /g) ?? []).length, 3);
  assert.match(options, /Select one of 34 catalog options/);
  assert.ok(options.includes(miningEnquiry(geometry.miningTool!, model).split(" | ")[0]));
  const table = render(createElement(MiningToolSpecifications, { product: geometry, selectedVariantId: model.id }));
  assert.equal((table.match(/data-selected="true"/g) ?? []).length, 1);
  assert.ok(table.includes(geometry.drawing!));
});
