#!/usr/bin/env python3
"""Extract reviewed catalog photographs with PyMuPDF; update image fields only.

No OCR, translation, specification extraction, or table reconstruction is used.
Mapping combines positioned model headings, approved embedded photo occurrences,
and reviewed table rectangles saved in product-image-map.json. Uncertain matches
remain placeholders. The original PDF is never modified.

Install: python -m pip install pymupdf Pillow
Run: python scripts/extract_product_images.py --pdf "path/to/catalog.pdf"
The map is tied to the source PDF SHA-256 and must be reviewed for a new catalog.
"""
from __future__ import annotations
import argparse
from collections import Counter, defaultdict
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import re
import tempfile

import pymupdf as fitz
from PIL import Image, ImageChops, ImageOps

DEFAULT_IMAGE = "/images/products/default-placeholder.svg"
PLACEHOLDER = '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#fff"/><g fill="none" stroke="#A8B0B8" stroke-width="2"><path d="M220 355V245l65-40 295 0v110l-65 40z"/><path d="m220 245 295 0 65-40M515 245v110M255 275h80v50h-80z"/><path d="M190 400h420M190 390v20m420-20v20"/></g></svg>'''


def digest(path):
    h = sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def atomic_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile('w', encoding='utf-8', dir=path.parent,
                                     suffix='.tmp', delete=False) as stream:
        json.dump(obj, stream, ensure_ascii=False, indent=2)
        stream.write('\n')
        tmp = Path(stream.name)
    tmp.replace(path)


def clean_filename(model):
    return re.sub(r'[^A-Za-z0-9_-]+', '_', model).strip('_') or 'product'


def model_prefixes(model):
    """Expand R/L shorthand without editing the source model code.

    A boundary-aware match prevents MRGNR from matching a different alphabetic
    family. Suffix variants such as -P or (B) remain part of their own prefix.
    """
    key = re.sub(r'\s+', '', model).upper()
    if 'R/L' in key:
        return [key.replace('R/L', 'R'), key.replace('R/L', 'L')]
    return [key]


def matches_prefix(model, family):
    key = re.sub(r'\s+', '', model).upper()
    if key == re.sub(r'\s+', '', family).upper():
        return True
    return any(re.match(re.escape(prefix) + r'(?=$|[0-9_.-])', key)
               for prefix in model_prefixes(family))


def heading_lines(page):
    lines = []
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            text = ''.join(span['text'] for span in line['spans']).strip()
            lines.append((text, fitz.Rect(line['bbox'])))
    return lines


def extract_rgba(doc, xref, masks):
    pix = fitz.Pixmap(doc, xref)
    if masks.get(xref):
        pix = fitz.Pixmap(pix, fitz.Pixmap(doc, masks[xref]))
    if pix.colorspace and pix.colorspace.n != 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    im = Image.open(BytesIO(pix.tobytes('png'))).convert('RGBA')
    bg = Image.new('RGBA', im.size, 'white')
    bg.alpha_composite(im)
    return bg.convert('RGB')


def trim_and_pad(im):
    delta = ImageChops.difference(im, Image.new('RGB', im.size, 'white'))
    bbox = delta.point(lambda x: 255 if x > 20 else 0).getbbox()
    if not bbox:
        raise ValueError('Approved image is blank after mask compositing.')
    im = im.crop(bbox)
    pad = max(18, round(max(im.size) * .05))
    return ImageOps.expand(im, border=pad, fill='white')


def run(pdf, root, map_path):
    mapping = json.loads(map_path.read_text(encoding='utf-8-sig'))
    source_hash = digest(pdf)
    if mapping.get('source_pdf_sha256') != source_hash:
        raise ValueError('Source PDF SHA-256 does not match the reviewed image map. Review a new map before extracting.')
    products_path = root / 'data/products.json'
    categories_path = root / 'data/categories.json'
    original = json.loads(products_path.read_text(encoding='utf-8-sig'))
    products = json.loads(json.dumps(original))
    categories_hash = digest(categories_path)
    product_by_id = {p['id']: p for p in products}
    if len(product_by_id) != len(products):
        raise ValueError('Duplicate product IDs; no data written.')
    image_dir = root / 'public/images/products'
    image_dir.mkdir(parents=True, exist_ok=True)
    (image_dir / 'default-placeholder.svg').write_text(PLACEHOLDER, encoding='utf-8')
    # Compatibility with the existing component fallback for unconfigured records.
    (root / 'public/images/product-placeholder.svg').write_text(PLACEHOLDER, encoding='utf-8')
    doc = fitz.open(pdf)
    masks = {i[0]: i[1] for page in doc for i in page.get_images()}
    occurrences = defaultdict(list)
    for number, page in enumerate(doc, 1):
        for item in page.get_image_info(xrefs=True):
            if item['xref']:
                occurrences[item['xref']].append({'source_page': number, 'bbox': list(item['bbox'])})
    approved = set(mapping['approved_heading_photo_xrefs'])
    assets, assignments, unresolved = {}, {}, {}
    by_page = defaultdict(list)
    for p in products:
        by_page[p['source_page']].append(p)
        p['image'] = DEFAULT_IMAGE

    def save_asset(xrefs, name, source_page, crop=None):
        signature = (tuple(xrefs), tuple(crop or []))
        if name in assets:
            if assets[name]['signature'] != signature:
                raise ValueError(f'Filename collision for different source images: {name}')
            return '/images/products/' + name
        parts = [extract_rgba(doc, x, masks) for x in xrefs]
        if crop:
            if len(parts) != 1:
                raise ValueError('Crop may only be used on a single reviewed embedded image.')
            im = parts[0]
            parts = [im.crop(tuple(round(v * (im.width if j % 2 == 0 else im.height)) for j, v in enumerate(crop)))]
        if len(parts) == 1:
            im = parts[0]
        else:
            normalized = []
            for part in parts:
                part = trim_and_pad(part)
                part.thumbnail((420, 300))
                normalized.append(part)
            im = Image.new('RGB', (sum(p.width for p in normalized), max(p.height for p in normalized)), 'white')
            x = 0
            for part in normalized:
                im.paste(part, (x, (im.height - part.height) // 2))
                x += part.width
        im = trim_and_pad(im)
        im.save(image_dir / name, 'JPEG', quality=94, subsampling=0, optimize=True)
        assets[name] = {'signature': signature, 'source_page': source_page,
                        'xrefs': xrefs, 'occurrences': {str(x): occurrences[x] for x in xrefs},
                        'crop_normalized': crop, 'width': im.width, 'height': im.height,
                        'sha256': digest(image_dir / name)}
        return '/images/products/' + name

    def assign(p, image, evidence):
        if p['id'] in assignments:
            raise ValueError('Conflicting image assignment: ' + p['id'])
        p['image'] = image
        assignments[p['id']] = {'product_id': p['id'], 'model': p['model'],
                                'image': image, 'source_page': p['source_page'], **evidence}
        unresolved.pop(p['id'], None)

    # Exact positioned family headings, in the same half-page and immediately
    # above/overlapping the embedded photo. Raster text blocks/drawings are not
    # candidates: a visually reviewed photo allowlist is mandatory.
    for n, rows in sorted(by_page.items()):
        page = doc[n - 1]
        lines = heading_lines(page)
        photos = [i for i in page.get_image_info(xrefs=True) if i['xref'] in approved]
        used_headings = set()
        for p in rows:
            if p['status'] != 'family_reference_only':
                continue
            hits = [(text, box) for text, box in lines
                    if re.sub(r'\s+', '', text) == re.sub(r'\s+', '', p['model'])
                    and box.y0 > 110 and tuple(box) not in used_headings]
            choices = []
            for text, box in hits:
                for image in photos:
                    rect = fitz.Rect(image['bbox'])
                    if (box.x0 < page.rect.width / 2) != (rect.x0 < page.rect.width / 2):
                        continue
                    dx, dy = abs(rect.x0 - box.x0), rect.y0 - box.y1
                    if dx <= 100 and -55 <= dy <= 105:
                        choices.append((abs(dy) + dx * .2, box, image))
            choices.sort(key=lambda item: item[0])
            override = mapping.get('heading_overrides', {}).get(p['id'])
            if override:
                hits_image = [i for i in photos if i['xref'] == override['xref']]
                if len(hits_image) != 1:
                    raise ValueError('Reviewed override occurrence missing: ' + p['id'])
                selected, box = hits_image[0], None
            elif choices:
                _, box, selected = choices[0]
                used_headings.add(tuple(box))
            else:
                unresolved[p['id']] = 'No unambiguous approved photograph paired with the exact positioned family heading.'
                continue
            basename = clean_filename(p['model'])
            filename = basename + '.jpg'
            # Preserve distinct internal/external and shank/head variants with
            # identical family codes; do not overwrite one with another.
            if filename in assets and assets[filename]['xrefs'] != [selected['xref']]:
                filename = f'{basename}_p{n:03d}_x{selected["xref"]}.jpg'
            image = save_asset([selected['xref']], filename, n)
            assign(p, image, {'method': 'reviewed embedded photograph + positioned exact family heading',
                             'family_prefixes': model_prefixes(p['model']),
                             'heading_bbox': list(box) if box else None,
                             'image_bbox': list(selected['bbox']), 'xref': selected['xref'],
                             'note': override['reason'] if override else 'Representative family image, not confirmation of an exact SKU configuration.'})

    # Reviewed table-region maps preserve the prior extractor's row/column
    # provenance. No table is read/rebuilt and no cross-page rows are merged.
    for entry in mapping['table_mappings']:
        xrefs = entry.get('xrefs') or [entry['xref']]
        image = save_asset(xrefs, entry['filename'], entry['source_page'], entry.get('crop'))
        for ident, expected_model in entry['records'].items():
            p = product_by_id.get(ident)
            if not p or p['model'] != expected_model or p['source_page'] != entry['source_page']:
                raise ValueError('Catalog identity changed; review table map: ' + ident)
            # This is an explicit page/table-scoped family set, not a global
            # startswith match that could mix BT/DIN/CAT or ER/ERM variants.
            assign(p, image, {'method': 'visually reviewed table-region family map',
                             'table_number': entry['table_number'], 'table_bbox': entry['table_bbox'],
                             'family_prefixes': model_prefixes(expected_model), 'note': entry['reason']})

    for entry in mapping['unresolved_tables']:
        for ident in entry['records']:
            if ident not in assignments:
                unresolved[ident] = entry['reason']
    for p in products:
        if p['id'] not in assignments:
            unresolved.setdefault(p['id'], 'Section-only/ambiguous entry; no specific model-level photo assignment approved.')

    def without_image(rows):
        return [{k: v for k, v in p.items() if k != 'image'} for p in rows]
    if without_image(original) != without_image(products):
        raise AssertionError('A non-image product field changed. Refusing write.')
    if digest(categories_path) != categories_hash:
        raise AssertionError('Category data changed during extraction.')
    manifest = {'source_pdf_sha256': source_hash, 'pdf_pages_inspected': len(doc),
                'products_total': len(products), 'products_with_real_images': len(assignments),
                'products_with_placeholder': len(unresolved), 'unique_image_files': len(assets),
                'non_image_fields_unchanged': True, 'categories_sha256_unchanged': categories_hash,
                'assignments': list(assignments.values()),
                'assets': {name: {k: v for k, v in a.items() if k != 'signature'} for name, a in assets.items()},
                'unresolved': [{'product_id': ident, 'model': product_by_id[ident]['model'],
                                'source_page': product_by_id[ident]['source_page'], 'reason': reason}
                               for ident, reason in unresolved.items()]}
    report = ['# Product image extraction report', '',
              f'- PDF pages inspected: {len(doc)} (embedded image inventory; no OCR).',
              f'- Existing records: {len(products)}.',
              f'- Records assigned a real catalog image: {len(assignments)}.',
              f'- Unique extracted JPEG files: {len(assets)}.',
              f'- Records left on the default placeholder: {len(unresolved)}.',
              '- Only `image` changed in products.json. All model codes, specifications, statuses and categories were preserved.',
              '- Chinese/bilingual page text, logos, tables, dimension drawings and badges are not published as product images.',
              '- Photos represent catalog families; they do not verify an exact size, orientation or configuration.',
              '- Family references stay family references, not verified SKU records. The UI labels them accordingly.',
              '- Cross-page exception: BT end-mill adapter continuation on PDF 152 reuses the reviewed PDF 151 family photo; no rows/specifications are merged.',
              '- Uncertain taper/prefix matches and composite/vector-only illustrations are deliberately left unresolved.',
              '- `scripts/product-image-map.json` stores reviewed table geometry, record identities, approved image xrefs and crops.',
              '- `product-image-manifest.json` records every assignment, source image rectangle, file digest and unresolved reason.', '',
              '## Unresolved records', '', '| Product ID | Model | PDF page | Reason |', '|---|---|---:|---|']
    for item in manifest['unresolved']:
        report.append('| ' + ' | '.join(str(item[k]).replace('|', '\\|') for k in ['product_id', 'model', 'source_page', 'reason']) + ' |')
    atomic_json(root / 'product-image-manifest.json', manifest)
    (root / 'product-image-extraction-report.md').write_text('\n'.join(report) + '\n', encoding='utf-8')
    atomic_json(products_path, products)
    reread = json.loads(products_path.read_text(encoding='utf-8'))
    assert without_image(reread) == without_image(original)
    print(json.dumps({k: manifest[k] for k in ['products_total', 'products_with_real_images', 'products_with_placeholder', 'unique_image_files', 'non_image_fields_unchanged']}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf', required=True, type=Path)
    parser.add_argument('--project-root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--map', type=Path, default=Path(__file__).with_name('product-image-map.json'))
    args = parser.parse_args()
    run(args.pdf.resolve(strict=True), args.project_root.resolve(strict=True), args.map.resolve(strict=True))
