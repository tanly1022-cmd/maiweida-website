import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, posix } from "node:path";
import { normalizeCatalog, normalizeCategories } from "../lib/catalog-core";

const root = "out";
assert.ok(existsSync(root), "Run npm run build first.");
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
}
const files = walk(root);
// Exact-case lookup catches errors that Windows accepts but Netlify/Linux rejects.
const inventory = new Set(files.map(file => relative(root, file).replaceAll("\\", "/")));
const checked = new Set<string>();
function checkAsset(value: string, page: string) {
  const src = value.replaceAll("&amp;", "&");
  if (src.startsWith("data:")) return;
  assert.ok(!/^https?:|^\/\//i.test(src), `Unexpected remote image in ${page}: ${src}`);
  assert.ok(!src.includes("_next/image"), `Runtime image API in ${page}: ${src}`);
  const clean = decodeURIComponent(src.split(/[?#]/)[0]);
  const asset = clean.startsWith("/") ? clean.slice(1) : posix.normalize(posix.join(posix.dirname(page), clean));
  assert.ok(inventory.has(asset), `Missing or case-mismatched image in ${page}: ${src}`);
  checked.add(asset);
}
let imageTags = 0;
for (const file of files.filter(file => file.endsWith(".html"))) {
  const page = relative(root, file).replaceAll("\\", "/");
  const html = readFileSync(file, "utf8");
  for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
    const src = tag.match(/\bsrc="([^"]+)"/);
    assert.ok(src, `Image without src in ${page}`);
    checkAsset(src[1], page);
    assert.ok(!/\bsrcset=/i.test(tag), `Unexpected image srcset in ${page}`);
    if (page.startsWith("products/")) assert.ok(tag.includes('loading="lazy"'), `Non-lazy catalog image in ${page}`);
    assert.match(tag, /\balt="[^"]+"/, `Image without descriptive alt in ${page}`);
    imageTags++;
  }
  assert.doesNotMatch(html, /name_zh_ref|category_zh_ref|description_zh_ref/, `Private fields in ${page}`);
  const whatsapp = (html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? []).filter(tag => tag.includes('class="whatsapp-contact"'));
  assert.equal(whatsapp.length, 1, `Expected one shared WhatsApp FAB in ${page}`);
  assert.ok(whatsapp[0].includes('href="https://wa.me/8618673309556"'), `Wrong WhatsApp business number in ${page}`);
  assert.match(whatsapp[0], /aria-label="Contact MAIVIDA on WhatsApp/);
  assert.ok(whatsapp[0].includes('<svg'), `WhatsApp icon missing in ${page}`);
  assert.equal(whatsapp[0].replace(/<[^>]*>/g, "").trim(), "", `WhatsApp FAB must have no visible text in ${page}`);
  assert.doesNotMatch(html, /YOUR_PHONE_NUMBER|Setup pending/, `Stale WhatsApp placeholder in ${page}`);
}
const readJson = (file: string) => JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
const categories = normalizeCategories(readJson("data/categories.json"));
const products = normalizeCatalog(readJson("data/products.json"), categories).filter(product => !product.isFamilyReference || !!product.image);
for (const product of products) {
  assert.ok(inventory.has(`products/${product.id}/index.html`), `Missing product route: ${product.id}`);
  checkAsset(product.image ?? "/images/product-placeholder.svg", `products/${product.id}/index.html`);
}
for (const asset of ["/images/hero-tool.jpg", "/images/product-placeholder.svg", "/images/og-cover.png"]) checkAsset(asset, "index.html");
const home = readFileSync(join(root, "index.html"), "utf8");
assert.ok(home.includes("MAIVIDA | Carbide Cutting Tools &amp; CNC Toolholding Supplier"), "Homepage SEO title missing");
const hero = (home.match(/<img\b[^>]*>/g) ?? []).find(tag => tag.includes('src="/images/hero-tool.jpg"'));
assert.ok(hero, "Homepage must contain a native img with the root-relative hero JPEG URL");
assert.match(hero, /loading="eager"/);
assert.doesNotMatch(hero, /_next\/image|_next\/static\/media|srcset=/i);
assert.deepEqual(readFileSync(join(root, "images/hero-tool.jpg")), readFileSync("public/images/hero-tool.jpg"), "Exported hero differs from the source JPEG");
assert.doesNotMatch(home, /hero-tool\.svg|Toolholding \/ reference view|Illustration only/, "Obsolete hero placeholder remains");
const catalog = readFileSync(join(root, "products/index.html"), "utf8");
assert.ok((catalog.match(/<img\b/g) ?? []).length <= 24, "Catalog rendered more than one page of images");
console.log(`Static export passed: ${products.length} product routes, ${imageTags} image tags, ${checked.size} exact-case local image assets. Catalog images are lazy; no runtime image API or private reference fields in HTML.`);
