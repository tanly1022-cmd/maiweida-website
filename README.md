# MAIWEIDA catalog preview

English-only Next.js App Router, TypeScript and Tailwind CSS. Run commands from this directory.

## Local preview

```powershell
npm.cmd install
npm.cmd run dev -- --webpack --port 3000
```

Open http://localhost:3000/products. If a development server is already listening on port 3000, reuse it rather than starting a second instance.

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

## Product data and categories

The canonical product sources are `data/products.json` and `data/categories.json`. Data is read on the server; only allowlisted English fields reach the UI. Chinese reference fields are private internal references and are never rendered. Empty/TBD fields are hidden; missing descriptions use the agreed English fallback.

Categories use two levels:

```json
[{"id":"turning-tools","name":"Turning Tools","children":[{"id":"m-style-external-turning-toolholders","name":"M style external turning toolholders"}]}]
```

Each source product has `category_en` (exact child name), `category_parent_en` and `category_id`. Keep category IDs unique. All seven requested parents and their required children remain in data; zero-count branches are hidden in the sidebar, dropdown and home entry points. Navigation counts reflect browsable records, not section-only or image-less family references.

`scripts/refactor_categories.py` is a repeatable JSON-only migration. It does not open or parse the PDF. Run it with Python 3 from any directory. It uses model prefixes, existing English categories and previously saved section context; unknown subtypes go under `Other [Parent]`. Review `category-mapping-report.md` and `category-mapping-manifest.json` before manually refining those assignments. The manifest retains original English category values and checksums of every non-category field. Edit the migration rules as well if a manual refinement must survive another migration run.

## Images

Replace files under `public/images/products/` and set each product's `image` to a local path such as `/images/products/MRGNR_L.jpg`. Do not replace family photographs with unrelated product configurations. Missing images use the local neutral schematic. Image-backed family references remain explicitly labeled, not promoted to verified SKUs. Existing image-extraction reports describe the earlier extraction run; their category checksums predate this authorized taxonomy migration.

## Contact / RFQ

`/contact` has the seven requested fields: Name, Company, Email, Country, Product Model, Quantity and Message. All Request a Quote links target this page; product-specific links prefill `?model=...`. Model and quantity are optional. Required fields, email syntax, field lengths and positive-integer quantities are validated in English. Errors and completion receive accessible focus.

**The form is deliberately a demo, including on a public deployment.** It is labeled before submission and in its success state. No personal details are sent, saved in browser storage, emailed or persisted. The demo does not promise a response within 24 hours. Do not use it for real enquiries until a service is connected.

Integration points are commented in `components/rfq-form.tsx`. For Formspree, configure a verified `NEXT_PUBLIC_FORMSPREE_ENDPOINT` and handle the provider's response before displaying a real submission confirmation. For Resend, add a server-side Route Handler and set `RESEND_API_KEY` only in server environment variables. Never expose secrets through a `NEXT_PUBLIC_*` variable or a Client Component. Add server-side validation, rate limiting, spam protection, appropriate consent/privacy information and genuine failure handling before accepting real enquiries. Setting environment variables alone does not enable delivery.

## Contact and deployment configuration

Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_CONTACT_EMAIL` to a verified business address; leave it empty to hide the address. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS production origin for canonical, Open Graph and structured-data URLs. Never put secrets in `NEXT_PUBLIC_*` variables.

Implemented routes: Home, Products, Product Detail, and Contact / RFQ. About and Industries destinations in the pre-existing navigation remain unfinished; do not represent them as completed pages. The RFQ is a demonstration, not an operational sales inbox.

For Vercel, run the commands from this directory (the Next.js project root):

```powershell
npx.cmd vercel login
npx.cmd vercel --prod
```

Alternatively import the project through Vercel and select the Next.js preset, Node 22, build command `npm run build`, and this directory as the project root. Configure the environment variables in Vercel. Redeploy after setting the final production origin. `.vercelignore` excludes local reports, tests, scripts and source PDFs from CLI uploads. Do not move internal JSON files into `public/`; product data is server-only and the UI uses an English field allowlist. After deploying, verify the catalog, product image, model-prefilled Contact page and demo completion on the public URL.

## Static export / ZIP deployment

The project uses `output: "export"`, `trailingSlash: true` and unoptimized local images in `next.config.ts` (the existing TypeScript equivalent of `next.config.js`). No Next.js server or Vercel login is required.

```powershell
npm.cmd run build
```

Deploy the **contents** of `out/` to a static host at the domain root. Keep `_next/`, `images/`, `products/` and `contact/` together with `index.html`. Directory-index hosting serves `/contact/` and every generated product route; do not flatten the folders or configure a catch-all SPA rewrite. Upload the ZIP to a host that supports ZIP extraction, or unzip it first. The ZIP contains deployment assets only, not private source JSON, source PDFs, node_modules, secrets or project tooling.

Catalog filtering/search/pagination run in the browser against normalized English display data from the existing product JSON. Every browsable product detail route is generated at build time. RFQ query-model prefill is handled in the browser, and the form remains a clearly labeled non-transmitting demo. Rebuild after changing data or images. JavaScript is needed for filters and the demo form; individual product detail pages contain static HTML.

Do not open `index.html` via `file://`; use an HTTP static server. For a local exported-site preview, run `python -m http.server 4173 --directory out` and open `http://localhost:4173/`. Security headers must be configured by your static hosting provider because Next.js runtime headers cannot run in an export. If desired set `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and `Permissions-Policy: camera=(), microphone=(), geolocation=()` there.

About and Industries routes remain the previously documented unfinished destinations. They are not added by the static-export task.

## Homepage assets, WhatsApp and export checks

The hero uses a native `<img src="/images/hero-tool.jpg">` serving the existing MRGNR/L catalog photograph from `public/images/hero-tool.jpg`; the social preview uses `public/images/og-cover.png`. Both files must stay in the export. `/images/...` paths are relative to the hosting origin and work on Netlify at the domain root, including when a visitor opens a nested product URL. Do not change these paths to `./images/...`, which would break on nested routes. All Next.js Image components are unoptimized for static hosting; catalog images remain lazy-loaded and results stay paginated at 24 products per page.

The fixed WhatsApp entry is an icon-only, 60px circular green (`#25D366`) button on every page, with a white SVG, subtle shadow and accessible screen-reader label. It sits 100px above the bottom edge plus the mobile safe-area inset to leave room for hosting badges. Its public business link is `https://wa.me/8618673309556`. To change the number, edit `DEFAULT_WHATSAPP_NUMBER` in `lib/whatsapp.ts` or set `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local` (international digits only, no `+` or spaces), then rebuild and redeploy. Empty or invalid configuration falls back to the business number.

The four homepage enquiry priorities use original inline line icons. Their supporting text requires order-specific confirmation rather than promising shipping times, inspection capability, custom manufacture or support arrangements.

Run `npm.cmd test`, `npm.cmd run build`, then `npm.cmd run check:export`. The export check verifies every product route, exact-case local image paths, lazy-loaded product images, the hero/social assets, the shared WhatsApp entry and the homepage title. It fails on missing images before you package `out/`. Deploy the entire export, including `_next/` and its routing payload files, not just HTML.

### Hero JPEG deployment verification

The hero JPEG is a byte-for-byte copy of the already extracted `public/images/products/MRGNR_L.jpg`; no PDF re-extraction or product-data changes are needed. `components/hero-image.tsx` uses an ordinary `img` with dimensions, eager loading and a root-relative URL. The remaining Next.js Image components still use the global `images.unoptimized: true` setting in `next.config.ts`, alongside `output: "export"`.

After deploying the **contents** of the new archive, open `/images/hero-tool.jpg` on your Netlify domain to confirm the image is served, then hard-refresh the homepage. If the old ?Toolholding / reference view? label remains, the browser or active deployment is still serving the previous homepage; the new label reads ?MRGNR/L / Turning toolholder?. The export check asserts that the HTML contains the JPEG image tag and none of the old hero placeholder text.
