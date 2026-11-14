import reference from "@/data/insert-reference.json";

/** These are catalog references, never a source of selectable product grades. */
export function InsertReferenceTables() {
  return <div className="mt-8 space-y-4">
    <details className="group border border-line bg-white">
      <summary className="cursor-pointer px-5 py-5 text-sm font-semibold text-steel">Grade comparison tables — turning & milling</summary>
      <div className="space-y-6 border-t border-line p-5">
        <p className="max-w-3xl text-xs leading-6 text-muted">Historical catalog comparisons, not certified equivalents or guaranteed substitutes. Other manufacturers are identified only to describe the reference codes; no affiliation is implied. Codes are retained as printed, including unusual entries. Confirm workpiece, operation, coating and geometry before substitution. A dash means the source cell is blank.</p>
        {reference.comparisons.map(section => <div key={section.operation} className="min-w-0">
          <h3 className="mb-3 text-base">{section.operation} grade references <span className="text-xs font-normal text-muted">/ catalog p. {section.sourcePage}</span></h3>
          <div role="region" aria-label={`${section.operation} grade comparison, scroll horizontally`} tabIndex={0} className="max-h-[34rem] overflow-auto border border-line focus-visible:outline-2 focus-visible:outline-steel">
            <table className="spec-table w-full min-w-[1120px]">
              <caption className="sr-only">{section.operation} grade comparison from the catalog. Not a substitution guarantee.</caption>
              <thead className="sticky top-0 bg-paper"><tr><th scope="col">ISO</th><th scope="col">Catalog grade</th>{reference.brands.map(brand => <th scope="col" key={brand}>{brand}</th>)}</tr></thead>
              <tbody>{section.rows.map(row => <tr key={`${row.group}-${row.grade}`}><td>{row.group}</td><th scope="row" className="whitespace-nowrap">{row.grade}</th>{row.references.map((codes, i) => <td key={i}>{codes ? codes.map(code => <span key={code} className="block whitespace-nowrap">{code}</span>) : "—"}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>)}
        <p className="text-xs leading-6 text-muted">Swipe or scroll horizontally to view every manufacturer column.</p>
      </div>
    </details>
    <details className="border border-line bg-white">
      <summary className="cursor-pointer px-5 py-5 text-sm font-semibold text-steel">Hardness conversion reference — ferrous metals</summary>
      <div className="border-t border-line p-5">
        <p className="max-w-3xl text-xs leading-6 text-muted">Approximate hardness and strength conversions transcribed from catalog p. {reference.hardness.sourcePage}. The source notes low-carbon steels and low conversion accuracy for strength. Its column heading says TRS (transverse rupture strength), while its footnote says tensile strength; this inconsistency requires supplier verification. This is not an insert performance or carbide strength specification. Source label: {reference.hardness.sourceStandardLabel}. A dash means no source value.</p>
        <p className="my-4 border-l-2 border-orange pl-4 text-xs leading-6 text-steel">† Source verification required: the strength column repeats the HB values at HRC 32.0–24.5, and HRA 76.9 is repeated at HRC 51.5. These values are preserved as printed, not silently corrected. Do not use flagged entries for engineering calculations.</p>
        <div role="region" aria-label="Hardness conversion table, scroll for all 107 rows" tabIndex={0} className="max-h-[30rem] overflow-auto border border-line focus-visible:outline-2 focus-visible:outline-steel">
          <table className="spec-table w-full min-w-[530px]">
            <caption className="sr-only">Approximate conversions for ferrous metals. Source anomalies marked with a dagger.</caption>
            <thead className="sticky top-0 bg-paper"><tr>{["HRC", "HRA", "HV", "HB", "Strength, source TRS (N/mm²)"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody>{reference.hardness.rows.map(row => <tr key={row.hrc} className={row.requiresVerification ? "bg-paper" : undefined}><th scope="row">{row.hrc.toFixed(1)}{row.requiresVerification ? " †" : ""}</th><td>{row.hra?.toFixed(1) ?? "—"}</td><td>{row.hv}</td><td>{row.hb ?? "—"}</td><td>{row.tensile ?? "—"}{row.requiresVerification ? " †" : ""}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </details>
  </div>;
}
