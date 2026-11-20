import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EndMillCatalog } from "../components/end-mill-catalog";
import { EndMillSpecifications } from "../components/end-mill-specifications";
import { normalizeCatalog, normalizeCategories, type Product } from "../lib/catalog-core";
import { END_MILL_FAMILIES, END_MILLS_PATH, endMillHeading, endMillSummary } from "../lib/end-mill-catalog";
import { buildSitemapEntries, canonicalUrl, productMetadata, productPath } from "../lib/seo";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const products = normalizeCatalog(read("data/end-mills.json"), normalizeCategories(read("data/categories.json")));

test("end mill collection exposes all catalog series and four real families without JavaScript", () => {
  const unrelated: Product = { id: "unrelated-holder", model: "Unrelated holder", description: "Holder", specs: [], needsReview: false, isFamilyReference: false };
  const html = renderToStaticMarkup(createElement(EndMillCatalog, { products: [...products, unrelated] }));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, />Solid Carbide End Mills<\/h1>/);
  assert.match(html, /17 series · 313 catalog model \/ dimension combinations/);
  for (const family of END_MILL_FAMILIES) {
    assert.ok(html.includes(`id="${family.id}"`));
    assert.ok(html.includes(`href="#${family.id}"`));
  }
  for (const product of products) {
    assert.ok(html.includes(`href="/products/${product.id}"`), product.id);
    assert.ok(html.includes(`src="${product.image}"`), product.id);
  }
  assert.doesNotMatch(html, /unrelated-holder|source_reference|sha256|sourcePdfPage/);
  assert.match(html, /href="\/products\/?#product-catalogs"/);
  assert.match(html, /href="\/contact\/?"/);
});

test("end mill metadata uses each series' exact catalog range, flute count and option count", () => {
  const descriptions = new Set<string>();
  for (const product of products) {
    const variants = product.endMill!.variants;
    const summary = endMillSummary(product)!;
    const min = Math.min(...variants.map(v => v.diameter)), max = Math.max(...variants.map(v => v.diameter));
    assert.equal(summary.diameter, min === max ? String(min) : `${min}–${max}`);
    assert.equal(summary.options, variants.length);
    const metadata = productMetadata(product);
    assert.equal(metadata.title, endMillHeading(product));
    assert.ok(metadata.description!.includes(`D ${summary.diameter} mm`));
    assert.ok(metadata.description!.includes(`${summary.flutes}-flute`));
    assert.ok(metadata.description!.includes(`${variants.length} catalog options`));
    assert.equal(metadata.alternates?.canonical, canonicalUrl(productPath(product.id)));
    assert.doesNotMatch(metadata.description!, /in stock|certified|guaranteed|manufacturer|coated|HRC|USD|\$/i);
    descriptions.add(metadata.description!);
    const html = renderToStaticMarkup(createElement(EndMillSpecifications, { product }));
    assert.ok(html.includes(`${summary.diameter} mm`));
    for (const variant of variants) assert.ok(html.includes(variant.model));
  }
  assert.equal(descriptions.size, products.length);
});

test("end mill summaries handle a single dimension and absent series without invented ranges", () => {
  const single = { ...products[0], endMill: { ...products[0].endMill!, variants: [products[0].endMill!.variants[0]] } };
  assert.equal(endMillSummary(single)!.diameter, String(single.endMill.variants[0].diameter));
  assert.equal(endMillSummary({ ...single, endMill: undefined }), undefined);
  assert.equal(endMillSummary({ ...single, endMill: { ...single.endMill, variants: [] } }), undefined);
});

test("end mill landing page is included once in the canonical sitemap alongside existing product URLs", () => {
  const urls = buildSitemapEntries(products).map(entry => entry.url);
  assert.equal(urls.filter(url => url === canonicalUrl(END_MILLS_PATH)).length, 1);
  for (const product of products) assert.ok(urls.includes(canonicalUrl(productPath(product.id))));
  assert.ok(urls.every(url => !new URL(url).search && !new URL(url).hash));
});
