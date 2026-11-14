import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { normalizeCatalog, normalizeCategories } from "../lib/catalog-core";
import { canonicalUrl, configuredGoogleVerification, productPath, STATIC_PAGE_PATHS } from "../lib/seo";
import { absoluteUrl, siteOrigin } from "../lib/site";

const root="out";
assert.ok(existsSync(root),"Run npm run build first.");
const read=(path:string)=>readFileSync(path,"utf8");
const readJson=(path:string)=>JSON.parse(read(path).replace(/^\uFEFF/,""));
const categories=normalizeCategories(readJson("data/categories.json"));
// Match lib/catalog.ts's public-route eligibility and physical-image checks.
const products=normalizeCatalog(readJson("data/products.json"),categories).map(product=>({
  ...product, image:product.image && existsSync(join("public",product.image)) ? product.image : undefined,
})).filter(product=>!product.isFamilyReference || !!product.image);
const expected=new Map<string,string>([
  ...STATIC_PAGE_PATHS.map(path=>[canonicalUrl(path),path] as const),
  ...products.map(product=>[canonicalUrl(productPath(product.id)),productPath(product.id)] as const),
]);
const xml=read(join(root,"sitemap.xml"));
assert.match(xml,/<urlset[^>]+xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
assert.ok(Buffer.byteLength(xml,"utf8")<50*1024*1024,"Sitemap is too large.");
assert.ok(expected.size<50000,"Split sitemap before exceeding the URL count limit.");
assert.doesNotMatch(xml,/<lastmod>|<priority>|<changefreq>|localhost|netlify\.app|vercel\.app/);
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert.equal(urls.length,expected.size,"Sitemap URL count differs from public page inventory.");
assert.equal(new Set(urls).size,urls.length,"Sitemap contains duplicate URLs.");
assert.deepEqual(new Set(urls),new Set(expected.keys()),"Sitemap contains missing or unexpected URLs.");
const robots=read(join(root,"robots.txt"));
assert.match(robots,/User-Agent: \*/i); assert.match(robots,/Allow: \//);
assert.doesNotMatch(robots,/Disallow:\s*\//i);
assert.ok(robots.includes("Sitemap: "+absoluteUrl("/sitemap.xml")));
const verification=configuredGoogleVerification(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);
function attr(tag:string,name:string):string|undefined {return tag.match(new RegExp('(?:^|\\s)'+name+'="([^"]*)"','i'))?.[1];}
const descriptions=new Set<string>();
const snippetPages=new Map<string,string[]>();
const staticDescriptions=new Set<string>();
for(const [url,path] of expected){
  const file=join(root,decodeURIComponent(path),"index.html");
  assert.ok(existsSync(file),"Sitemap points at a missing HTML file: "+url);
  const html=read(file), head=html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  assert.ok(head,"Missing HTML head: "+url);
  const canonical=(head.match(/<link\b[^>]*>/g)??[]).filter(tag=>attr(tag,"rel")==="canonical");
  assert.equal(canonical.length,1,"Expected exactly one canonical: "+url);
  assert.equal(attr(canonical[0],"href"),url,"Non-self-referencing canonical: "+url);
  const meta=head.match(/<meta\b[^>]*>/g)??[];
  const og=meta.find(tag=>attr(tag,"property")==="og:url");
  assert.equal(og && attr(og,"content"),url,"Open Graph URL differs from canonical: "+url);
  const desc=meta.find(tag=>attr(tag,"name")==="description");
  const content=desc && attr(desc,"content"); assert.ok(content,"Missing description: "+url); descriptions.add(content);
  const sameSnippet=snippetPages.get(content)||[]; sameSnippet.push(url); snippetPages.set(content,sameSnippet);
  if((STATIC_PAGE_PATHS as readonly string[]).includes(path)) staticDescriptions.add(content);
  const title=head.match(/<title>([^<]+)<\/title>/)?.[1]; assert.ok(title,"Missing title: "+url);
  const robot=meta.find(tag=>attr(tag,"name")==="robots");
  assert.ok(robot && /index/.test(attr(robot,"content")||""),"Missing robots index: "+url);
  assert.ok(!/noindex|nofollow/i.test(attr(robot!,"content")||""),"Unexpected indexing restriction: "+url);
  const google=meta.filter(tag=>attr(tag,"name")==="google-site-verification");
  assert.equal(google.length,verification?1:0,"Wrong Google verification-tag count: "+url);
  if(verification) assert.equal(attr(google[0],"content"),verification);
  if(path.startsWith("/products/")&&path!=="/products/"){
    const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));
    const product=schemas.find(item=>item["@type"]==="Product");
    assert.ok(product,"Product structured data missing: "+url);
    assert.equal(product.url,url,"Structured-data URL differs from canonical: "+url);
    assert.ok(!product.offers && !product.aggregateRating && !product.review,"Do not invent prices or reviews: "+url);
  }
}
assert.equal(staticDescriptions.size,STATIC_PAGE_PATHS.length,"Static page descriptions must be distinct.");
// Existing catalog rows can refer to the same model. Do not invent differences,
// delete URLs or consolidate canonicals without reviewing the product data.
const duplicateSnippets=[...snippetPages.values()].filter(pages=>pages.length>1);
// Product routes not in the data are not generated; both error export pages remain noindex.
for(const file of ["404.html","404/index.html"]){
  const html=read(join(root,file));
  assert.match(html,/<meta name="robots" content="noindex"\s*\/?>/,"404 should remain noindex: "+file);
}
console.log(JSON.stringify({result:"passed",origin:siteOrigin,staticPages:STATIC_PAGE_PATHS.length,productPages:products.length,sitemapUrls:urls.length,uniqueDescriptions:descriptions.size,duplicateDescriptionGroups:duplicateSnippets.length,duplicateDescriptionPages:duplicateSnippets.reduce((sum,pages)=>sum+pages.length,0),sitemapBytes:statSync(join(root,"sitemap.xml")).size,googleVerificationConfigured:Boolean(verification)},null,2));
