# Catalog product images

Run from the project root:

```powershell
python -m pip install pymupdf Pillow
python scripts/extract_product_images.py --pdf "path/to/catalog.pdf"
npm test
npm run dev -- --webpack --port 3000
```

The script inventories embedded images page by page using PyMuPDF. It uses positioned exact family headings and the reviewed, page/table-scoped family map in `product-image-map.json`. Model prefixes are scoped to their source table to avoid mixing unrelated BT, CAT, DIN or ER variants. R/L shorthand and source models are not rewritten.

The reviewed map is tied to the PDF SHA-256. Do not bypass the hash guard for a replacement catalog: review image occurrences, heading/table geometry and family membership first. Low-confidence mappings deliberately retain `/images/products/default-placeholder.svg`.

No OCR, translation or specification extraction occurs. Only `image` fields in `data/products.json` are changed; categories and all other fields are verified unchanged. Transparent embedded photos are composited on white. Reviewed crops remove adjacent dimension drawings, and one chuck-set image combines its three source product photos.

Outputs are saved in `public/images/products/`, `product-image-manifest.json` and `product-image-extraction-report.md`. The manifest records PDF pages, xrefs, image rectangles, table provenance, file digests and unresolved assignments. Family photos are representative, not verification of an exact size/orientation. Image-backed family entries are labeled as references in the UI; source statuses remain unchanged.

A reviewed BT end-mill adapter continuation on PDF page 152 reuses its page 151 family image. No cross-page rows or specifications are merged.
