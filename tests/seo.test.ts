import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { resolveSiteOrigin } from "../lib/site-origin";
import { absoluteUrl, siteOrigin } from "../lib/site";
import { buildSitemapEntries, canonicalUrl, configuredGoogleVerification, DEFAULT_GOOGLE_SITE_VERIFICATION, googleVerification, pageMetadata, productMetadata, productPath, STATIC_PAGE_PATHS } from "../lib/seo";
import type { Product } from "../lib/catalog-core";

const sample: Product = { id: "mwd-cnmg-120408", model: "CNMG120408", name: "Turning insert", description: "Catalog reference.", specs: [], needsReview: true, isFamilyReference: false };
test("production origin defaults to the real domain, not a preview or missing URL", () => {
  assert.equal(resolveSiteOrigin(), "https://maivida.com");
  assert.equal(resolveSiteOrigin("  "), "https://maivida.com");
  assert.equal(resolveSiteOrigin("https://maivida.com/"), "https://maivida.com");
  assert.equal(resolveSiteOrigin("https://example.com"), "https://example.com");
});
test("invalid configured origins fail visibly instead of silently losing canonical URLs", () => {
  for (const value of ["maivida.com", "ftp://maivida.com", "https://maivida.com/sub", "https://maivida.com/?x=1", "https://maivida.com/#fragment", "https://user:pass@maivida.com"])
    assert.throws(() => resolveSiteOrigin(value));
});
test("all canonical page URLs use the static export trailing slash convention", () => {
  assert.equal(canonicalUrl("/"), siteOrigin + "/");
  assert.equal(canonicalUrl("/products"), siteOrigin + "/products/");
  assert.equal(canonicalUrl("/products///"), siteOrigin + "/products/");
  assert.throws(() => canonicalUrl("/products?category=Turning"));
  assert.throws(() => canonicalUrl("/products#filter"));
});
test("site URL helper rejects external and relative-path destinations", () => {
  for (const value of ["//evil.example/a", "https://evil.example", "products/", "/\\evil.example/a"])
    assert.throws(() => absoluteUrl(value));
  assert.equal(absoluteUrl("/images/og-cover.png"), siteOrigin + "/images/og-cover.png");
});
test("page metadata has matching canonical and Open Graph URLs and a per-page description", () => {
  const metadata=pageMetadata("About Maivida Tech", "About the supplier.", "/about");
  assert.equal(metadata.alternates?.canonical, siteOrigin + "/about/");
  assert.equal(metadata.openGraph?.url, siteOrigin + "/about/");
  assert.equal(metadata.description, "About the supplier.");
  assert.equal(metadata.openGraph?.title, "About Maivida Tech | MAIVIDA");
  assert.ok(JSON.stringify(metadata.twitter).includes("About the supplier."));
});
test("product URLs encode IDs and do not change existing simple route IDs", () => {
  assert.equal(productPath(sample.id), "/products/mwd-cnmg-120408/");
  assert.equal(productPath("a/b?x=1"), "/products/a%2Fb%3Fx%3D1/");
});
test("product snippets identify the actual model without inventing stock or prices", () => {
  const metadata=productMetadata(sample);
  assert.equal(metadata.title, "CNMG120408 - Turning insert");
  assert.ok(metadata.description?.startsWith("CNMG120408 - Turning insert."));
  assert.equal(metadata.alternates?.canonical, canonicalUrl(productPath(sample.id)));
  assert.doesNotMatch(metadata.description!, /in stock|certified|guaranteed|manufacturer|factory|USD|\$/i);
});
test("family references remain qualified as references, not verified SKUs", () => {
  const metadata=productMetadata({...sample,isFamilyReference:true});
  assert.match(metadata.description!, /Catalog family reference/);
  assert.match(metadata.description!, /Confirm exact size/);
});
test("sitemap includes exactly the public static pages and supplied product routes", () => {
  const entries=buildSitemapEntries([sample,{id:sample.id},{id:"another-model"}]);
  assert.equal(entries.length,STATIC_PAGE_PATHS.length+2);
  assert.equal(new Set(entries.map(e=>e.url)).size,entries.length);
  for(const entry of entries){
    const url=new URL(entry.url);
    assert.equal(url.origin,siteOrigin);
    assert.equal(url.search,""); assert.equal(url.hash,"");
    assert.ok(url.pathname.endsWith("/"));
    assert.equal(entry.lastModified,undefined);
    assert.equal(entry.priority,undefined);
    assert.equal(entry.changeFrequency,undefined);
  }
});
test("sitemap generation handles an empty catalog without inventing product URLs", () => {
  assert.equal(buildSitemapEntries([]).length,STATIC_PAGE_PATHS.length);
});
test("raw verification parser accepts tokens but rejects HTML tags", () => {
  assert.equal(googleVerification(),undefined);
  assert.equal(googleVerification("  "),undefined);
  assert.equal(googleVerification(" abc_DEF-123 "),"abc_DEF-123");
  assert.throws(()=>googleVerification('<meta name="google-site-verification" content="abc" />'));
});
test("metadata route handlers are explicitly static and use the actual exported catalog", () => {
  const robots=readFileSync("app/robots.ts","utf8"), sitemap=readFileSync("app/sitemap.ts","utf8");
  for(const source of [robots,sitemap]) assert.match(source,/dynamic = "force-static"/);
  assert.match(robots,/userAgent: "\*", allow: "\/"/);
  assert.match(robots,/absoluteUrl\("\/sitemap\.xml"\)/);
  assert.match(sitemap,/import \{ products \} from "@\/lib\/catalog"/);
  assert.match(sitemap,/buildSitemapEntries\(products\)/);
});

test("site uses the owner-supplied public token by default, with a validated environment override", () => {
  assert.equal(DEFAULT_GOOGLE_SITE_VERIFICATION, "wKYuSGR-gsvtBZiWj5pIHm9yzpwmIect92dqU42tHkQ");
  assert.equal(configuredGoogleVerification(), DEFAULT_GOOGLE_SITE_VERIFICATION);
  assert.equal(configuredGoogleVerification("  "), DEFAULT_GOOGLE_SITE_VERIFICATION);
  assert.equal(configuredGoogleVerification(" another_public-token "), "another_public-token");
  assert.throws(() => configuredGoogleVerification('<meta content="abc" />'));
  const layout = readFileSync("app/layout.tsx", "utf8");
  assert.match(layout, /const verification = configuredGoogleVerification\(process\.env\.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION\)/);
  assert.match(layout, /verification: \{ google: verification \}/);
});
