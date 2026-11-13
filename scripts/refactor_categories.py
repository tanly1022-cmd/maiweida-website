"""Deterministic taxonomy migration. Reads JSON only; never opens the PDF.
Run from any directory with Python 3. Original English categories are retained in
category-mapping-manifest.json so repeated runs do not lose source context.
"""
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TREE = {
    "Turning Tools": ["M style external turning toolholders", "P style external turning toolholders", "S style external turning toolholders", "C style external turning toolholders", "D style external turning toolholders", "W style external turning toolholders", "M style internal turning toolholders", "P style internal turning toolholders", "S style internal turning toolholders", "Tungsten Anti-shaking internal turning toolholders", "External threading toolholders", "Internal threading toolholders", "External parting, grooving and turning toolholders"],
    "Milling Tools": ["Face milling tools", "Square-shoulder milling tools", "Profile milling tools", "Side and face milling tools", "Chamfer milling tools", "High feed milling cutter", "Helical end face milling tools", "Mould milling tools", "Solid carbide end mills"],
    "Boring Tools": ["Micro-adjustable Cutter Holder", "Boring Unit"],
    "Drilling Tools": ["Indexable drilling tools", "Carbide drill bits"],
    "CNC Inserts": ["Turning inserts", "Milling inserts", "Threading inserts", "Parting and grooving inserts", "U drill inserts", "Aluminum insert"],
    "Tooling Systems": ["Arbors", "Spare parts"],
    "Accessories": [],
}

def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def fingerprint(row):
    retained = {k: v for k, v in row.items() if k not in ("category_en", "category_parent_en", "category_id")}
    return hashlib.sha256(json.dumps(retained, sort_keys=True, ensure_ascii=True).encode()).hexdigest()

def classify(row, original):
    model = row["model"].upper().strip()
    page = row["source_page"]
    def match(parent, child, reason):
        return parent, child, reason
    def other(parent, reason):
        return match(parent, "Other " + parent, reason)
    if 6 <= page <= 30:
        if re.match(r"[MPSCDW][A-Z]{4}", model):
            return match("Turning Tools", model[0] + " style external turning toolholders", "Holder prefix plus saved external-holder section (pages 6-30).")
        return other("Turning Tools", "External section; unrecognized holder prefix.")
    if 31 <= page <= 41:
        if re.match(r"[MPS][A-Z]{4}", model):
            return match("Turning Tools", model[0] + " style internal turning toolholders", "Holder prefix plus saved internal-holder section (pages 31-41).")
        return other("Turning Tools", "Internal holder; requested tree has no matching style branch.")
    if page in (42, 43):
        return match("Turning Tools", "Tungsten Anti-shaking internal turning toolholders", "Saved page renders 42-43: English tungsten internal-holder section heading.")
    if page == 44:
        if model.startswith("SWR"):
            return match("Turning Tools", "External threading toolholders", "SWR threading family in saved threading section.")
        if model.startswith("SNR"):
            return match("Turning Tools", "Internal threading toolholders", "SNR threading family in saved threading section.")
        return other("Turning Tools", "Threading family not recognized.")
    if 45 <= page <= 53:
        if model.startswith(("MGEHR", "SGTR", "KGBR", "SPB-S", "ZQ")):
            return match("Turning Tools", "External parting, grooving and turning toolholders", "External grooving/parting family prefix and saved section context.")
        return other("Turning Tools", "Internal grooving or ambiguous grooving family; no unsupported external assignment.")
    if 59 <= page <= 120:
        if model in ("AF05", "AF06"):
            return match("Milling Tools", "Face milling tools", "Saved page 62 render explicitly labels these face milling families.")
        if model.startswith(("EMR", "TRS")):
            return match("Milling Tools", "Mould milling tools", "Saved page 119 render: MOLD MILLING TOOLS heading.")
        return other("Milling Tools", "Milling section known, but proprietary prefix does not establish requested cutting geometry/application.")
    if 121 <= page <= 127:
        if model.startswith("UD"):
            return match("Drilling Tools", "Indexable drilling tools", "UD drilling family and saved page 123/127 indexable-drill imagery.")
        return other("Drilling Tools", "Drilling section; unrecognized prefix.")
    if 130 <= page <= 135:
        return other("Boring Tools", "Boring-head family; exact requested micro-adjustable/unit distinction is not confirmed.")
    if 143 <= page <= 169:
        category = original.upper()
        spare = {"RETENTION KNOB", "FIXED SCREW", "PT-TYPE WRENCH", "SPANNER", "ER NUT", "EOC/SK CLAMPING NUT", "DC COLLET", "ERC COLLET", "MILLING COLLET", "STRAIGHT SHANK COLLETS", "TAPPING COLLET", "ER SERIES COLLETS WITH STANDARD DIN6499B", "SK HIGH SPEED DOLLET", "CSO OIL-FEED HOLDERS REDUCING SLEEVE", "CSO OIL ROAD STOP BLOCK"}
        if category in spare:
            return match("Tooling Systems", "Spare parts", "Original English accessory category: " + original)
        if category != "TBD" and any(term in category for term in ("ARBOR", "HOLDER", "ADAPTER", "CHUCK", "SHANK", "TAPER", "HANDLE", "COMBINATION SERIES", "COLLET SET")):
            return match("Tooling Systems", "Arbors", "Original English toolholding category: " + original)
        if model.startswith("HSK") and "-TER" in model:
            return match("Tooling Systems", "Arbors", "HSK-TER holder prefix in saved toolholding section.")
        return other("Tooling Systems", "Toolholding section, but English type/prefix remains ambiguous.")
    return other("Accessories", "No supported parent/subcategory match in existing source data.")

def main():
    products_path = ROOT / "data/products.json"
    rows = json.loads(products_path.read_text(encoding="utf-8-sig"))
    manifest_path = ROOT / "category-mapping-manifest.json"
    previous = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {"assignments": []}
    originals = {r["id"]: r["original_category_en"] for r in previous["assignments"]}
    assignments = []
    for row in rows:
        original = originals.get(row["id"], row["category_en"])
        before = fingerprint(row)
        parent, child, reason = classify(row, original)
        row.update(category_parent_en=parent, category_en=child, category_id=slug(child))
        assert fingerprint(row) == before
        assignments.append({"id": row["id"], "original_category_en": original, "parent": parent, "category": child, "reason": reason, "preserved_fields_sha256": before})
    categories = [{"id": slug(parent), "name": parent, "children": [{"id": slug(child), "name": child} for child in children + ["Other " + parent]]} for parent, children in TREE.items()]
    def write(path, data):
        temporary = path.with_suffix(path.suffix + ".tmp")
        temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        temporary.replace(path)
    write(ROOT / "data/categories.json", categories)
    write(products_path, rows)
    write(manifest_path, {"version": 1, "source": "Existing products.json and previously saved catalog context only; no PDF read or extraction.", "assignments": assignments})
    counts = Counter((a["parent"], a["category"]) for a in assignments)
    lines = ["# Category mapping report", "", f"Mapped {len(rows)} existing records. No products, models, images, specs or reference statuses were added or removed.", "", "Only category_en, category_parent_en and category_id were changed. The manifest retains original English categories, decisions and checksums of all preserved fields.", "", "Counts below cover source records; the UI counts only browsable records. Zero-count branches are retained in data and hidden in navigation.", "", "## Mapping counts", ""]
    for parent in TREE:
        lines += ["### " + parent]
        lines += [f"- {child}: {count}" for (p, child), count in sorted(counts.items()) if p == parent]
        if not any(p == parent for p, child in counts):
            lines += ["- No source records. Hidden in navigation."]
        lines += [""]
    lines += ["## Conservative fallbacks / manual review", "", "Proprietary milling prefixes do not reliably establish exact applications. Only previously saved English/visual evidence is used for finer assignments. Boring heads remain Other Boring Tools until the unit/micro-adjustable distinction is confirmed. D-style internal holders and internal grooving families have no exact child in the supplied tree. Empty CNC insert and solid-carbide branches are not filled with invented records.", "", "| Record | Model | Category | Reason |", "| --- | --- | --- | --- |"]
    by_id = {r["id"]: r for r in rows}
    for a in assignments:
        if a["category"].startswith("Other "):
            model = by_id[a["id"]]["model"].replace("|", " / ")
            lines.append(f"| {a['id']} | {model} | {a['category']} | {a['reason']} |")
    (ROOT / "category-mapping-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Mapped {len(rows)} products; {sum(a['category'].startswith('Other ') for a in assignments)} conservative fallbacks.")

if __name__ == "__main__":
    main()
