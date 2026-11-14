# MAIVIDA Google indexing setup

Prepared: 2026-11-15 (Asia/Shanghai). Baseline: GitHub commit `9fedfb0ba2fae28a4378b198178197a37ecf3afb`.

## Scope and status

This is a locally tested source-code update. It has NOT been pushed to GitHub or deployed to Netlify. No Search Console property has been created or verified, and no sitemap or URL has been submitted to Google. Indexing, ranking and enquiries are not guaranteed.

The original Next.js 16.4.6 project already contained canonical metadata, but its origin helper returned undefined when NEXT_PUBLIC_SITE_URL was unset. The public homepage inspected on 2026-11-15 did not emit a canonical tag. Public /robots.txt and /sitemap.xml returned HTTP 404. A missing robots file is not itself a crawl prohibition, and a missing sitemap does not itself prevent indexing.

## Changes

- Default the canonical origin to https://maivida.com. Validate a nonempty override; do not use a Netlify preview hostname automatically.
- Generate static /robots.txt and /sitemap.xml during the existing output: export build.
- Reuse the public catalog eligibility logic. The current build has 1,825 sitemap URLs: five static pages and 1,820 existing product/reference routes. This is a route count, NOT a count of verified SKUs, Google-indexed pages or guaranteed ranking opportunities.
- Use self-referencing trailing-slash canonicals, matching Open Graph URLs and consistent Product structured-data URLs.
- Add distinct static-page descriptions and model-led product metadata, while retaining family-reference qualifications. No new stock, performance, certification, price or review claims.
- Include the public Google HTML-tag verification token supplied by the owner on 2026-11-15, with an optional environment override, plus isolated SEO regression/audit commands. This is not completed Search Console verification.
- Leave product JSON, category JSON, images, RFQ form logic, WhatsApp number, next.config.ts and netlify.toml unchanged.

## Configuration

In Netlify, review the existing environment variables before a preview build:

```text
NEXT_PUBLIC_SITE_URL=https://maivida.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

The first variable is recommended explicitly but has the same fallback in code. A nonempty wrong domain is not silently replaced: correct any stale origin setting. The owner has now supplied the real public token and it is bundled in lib/seo.ts. Leave NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION blank/unset to use that token; a nonempty value overrides it and must not be stale. For any override, paste only the content value, not the whole HTML tag. The token is public verification metadata, not a Google password. Rebuild after changing these values.

Keep existing NEXT_PUBLIC_FORMSPREE_ENDPOINT, contact email and WhatsApp settings. Do not replace existing environment variables with a downloaded example file. No email-delivery or mailbox DNS changes are needed for the HTML-tag verification option.

## Local checks

```powershell
npm.cmd ci
npm.cmd run test:seo
npm.cmd run typecheck
npm.cmd run check:data
npm.cmd run build
npm.cmd run check:export
npm.cmd run check:seo
```

The SEO audit checks every sitemap target against the actual exported HTML, validates canonical/Open Graph URLs, descriptions, indexability, Product schema URLs, robots and Google verification state. It also reports duplicate description groups rather than inventing distinctions between duplicate catalog rows.

## Existing limitations (not hidden by this update)

- Full npm test baseline: 16 pass and 2 file-level failures. After the update including the owner-token regression test: 29 pass and the same 2 failures. The missing files are category-mapping-manifest.json and product-image-manifest.json; they are ignored by the source repository and absent from the supplied ZIP. The historical tests were not deleted, skipped or rewritten. Restore authentic original manifests if those historical checks are required; do not fabricate them.
- SEO tests: 13/13 pass. Typecheck, build, data check, existing static export check and new SEO export audit pass.
- Current product/reference routes include 492 generic-description references and 72 without a real product photograph. These are existing catalog limitations; the update does not certify their content quality.
- 41 groups (87 routes; 46 repeated descriptions beyond the first group member) share the same model-led description. They need human review of the underlying models/images/specifications before deciding whether to merge, differentiate or redirect them. Routes and canonicals are not silently consolidated.
- The existing Industries article contains numeric market claims without citations. They were not fact-checked or rewritten in this technical patch. Review them before wider promotion.
- Category filters remain query-based client-side catalog filters. Dedicated server-rendered category landing pages and fuller application/specification content are a later editorial/SEO task, not included in this patch.
- No live Googlebot, Search Console coverage, Google-selected canonical, delivery of RFQs or search ranking has been verified. Existing external service settings remain unchanged.

## Safe deployment

1. Keep the original ZIP as a backup. Confirm main and the current Published Netlify deployment are still the reviewed commit. If either changed, merge these edits into the new source instead of overwriting it.
2. Use a new branch such as seo-google-indexing-20261115. Apply the changed files at the repository root, preserving app/, lib/, scripts/ and tests/ paths. Do not upload a ZIP file as if it were executable source. Do not replace the repository with the old static site bundle.
3. Review the patch and run the checks above. Trigger only a preview deployment first. Preview pages should keep the production canonical origin. Verify the preview environment is not unintentionally exposed for indexing, and do not submit the preview hostname to Google.
4. Check preview /robots.txt, /sitemap.xml, homepage source, one product, About and RFQ form display. Inspect actual verification metadata after the real token is configured. There is no visual redesign or production form submission in this test process.
5. Only after owner approval, merge into main. The existing Netlify automatic publish setting may update production immediately on that merge. No merge or publish has been performed in this task.
6. Re-check the production origin, HTTPS, www redirect, trailing slash handling, sitemap/robots HTTP 200, a nonexistent product HTTP 404 and the absence of noindex on intended public pages. Confirm environment changes did not alter the RFQ provider configuration.

## Search Console handoff

1. The owner signs in to Google Search Console personally.
2. Either verify the domain property maivida.com with the exact DNS record Google supplies, or verify the URL-prefix property https://maivida.com/ using the HTML-tag token supported by this patch. A URL-prefix property covers that prefix, not every protocol/subdomain.
3. The actual HTML-tag token was supplied by the owner and is already bundled. Review any pre-existing Netlify override, deploy this updated source after approval, and confirm production homepage source contains the exact owner-supplied tag before clicking Verify in Search Console. Do not click Verify merely because a local build passed.
4. Submit https://maivida.com/sitemap.xml under Sitemaps. Use URL Inspection on the homepage and a few content-rich product pages; test live access, inspect any restrictions and request indexing when appropriate.
5. Monitor actual processing results. Submission does not guarantee crawling, indexing or ranking. Do not repeatedly submit the same URLs or use the Google Indexing API as a general product-catalog shortcut.

## Official references

- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- https://nextjs.org/docs/app/guides/static-exports
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://support.google.com/webmasters/answer/9008080

Implementation was checked against the installed Next.js 16.4.6 node_modules/next/dist/docs guides as required by AGENTS.md.
