import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import config from "../next.config";
import { HeroImage } from "../components/hero-image";
import { ProductImage } from "../components/product-card";
import { TrustSection } from "../components/trust-section";
import { WhatsAppButton } from "../components/whatsapp-button";
import { whatsappContact } from "../lib/whatsapp";
import type { Product } from "../lib/catalog-core";

test("static image configuration and homepage assets are self-contained", () => {
  assert.equal(config.output, "export");
  assert.equal(config.images?.unoptimized, true);
  for (const path of ["hero-tool.jpg", "product-placeholder.svg", "og-cover.png"]) assert.ok(existsSync(`public/images/${path}`), path);
  const jpg = readFileSync("public/images/hero-tool.jpg");
  assert.equal(jpg.subarray(0, 3).toString("hex"), "ffd8ff");
  assert.deepEqual(jpg, readFileSync("public/images/products/MRGNR_L.jpg"));
  const html = renderToStaticMarkup(createElement(HeroImage));
  assert.match(html, /<img[^>]+src="\/images\/hero-tool\.jpg"/);
  assert.match(html, /loading="eager"/);
  assert.match(html, /width="434" height="290"/);
  assert.doesNotMatch(html, /_next\/image|_next\/static\/media|srcSet=|hero-tool\.svg/);
});

test("shared product image is lazy and never requests the image optimization API", () => {
  const product: Product = { id: "test", model: "Reference", description: "Specifications available upon request.", specs: [], needsReview: true, isFamilyReference: false };
  for (const image of [undefined, "/images/products/PCBNR_L.jpg"]) {
    const html = renderToStaticMarkup(createElement(ProductImage, { product: { ...product, image } }));
    assert.match(html, /loading="lazy"/);
    assert.ok(html.includes(`src="${image ?? "/images/product-placeholder.svg"}"`));
    assert.doesNotMatch(html, /_next\/image|srcSet=/);
  }
});

test("WhatsApp uses the real business number and rejects malformed overrides", () => {
  assert.deepEqual(whatsappContact(undefined), { configured: true, href: "https://wa.me/8618673309556" });
  assert.equal(whatsappContact("").href, "https://wa.me/8618673309556");
  assert.equal(whatsappContact("+1 234").href, "https://wa.me/8618673309556");
  assert.equal(whatsappContact("+1 234").configured, false);
  assert.equal(whatsappContact("12345678901").href, "https://wa.me/12345678901");
  assert.equal(whatsappContact("javascript:alert(1)").configured, false);
});

test("homepage has four qualified enquiry priorities without shipping guarantees", () => {
  const html = renderToStaticMarkup(createElement(TrustSection));
  for (const label of ["Why Choose MAIVIDA", "Fast Global Shipping", "Strict Quality Control", "Custom Tooling Solutions", "Engineering Support"]) assert.ok(html.includes(label));
  assert.equal((html.match(/<svg/g) ?? []).length, 4);
  assert.match(html, /must be confirmed/);
});

test("WhatsApp FAB is icon-only, accessible, circular and above hosting badges", () => {
  const html = renderToStaticMarkup(createElement(WhatsAppButton));
  assert.match(html, /href="https:\/\/wa\.me\/8618673309556"/);
  assert.match(html, /aria-label="Contact MAIVIDA on WhatsApp \(opens in a new tab\)"/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /<svg[^>]+aria-hidden="true"/);
  assert.equal(html.replace(/<[^>]*>/g, "").trim(), "");
  const css = readFileSync("app/globals.css", "utf8");
  const rule = css.match(/\.whatsapp-contact\s*\{([^}]+)\}/)?.[1] ?? "";
  for (const declaration of ["width: 60px", "height: 60px", "border-radius: 50%", "background: #25D366", "color: #fff", "bottom: calc(100px + env(safe-area-inset-bottom, 0px))", "box-shadow:"]) assert.ok(rule.includes(declaration), declaration);
});
