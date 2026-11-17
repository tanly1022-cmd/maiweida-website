import type { Product } from "@/lib/catalog-core";

export function EndMillSpecifications({ product }: { product: Product }) {
  if (!product.endMill) return null;
  return <section aria-labelledby="end-mill-specifications" className="mb-16 border-t border-line pt-9">
    <p className="text-xs uppercase tracking-widest text-muted">Catalog dimensions</p>
    <h2 id="end-mill-specifications" className="mt-4 text-2xl md:text-3xl">{product.model} — model specifications</h2>
    <p className="mt-4 text-sm leading-7 text-muted">Each row is a catalog combination, not an independently generated size. D = cutting diameter; R = tip or corner radius; H = flute length; L = overall length; d = shank diameter. All dimensions in mm.</p>
    <div role="region" aria-label={`${product.model} dimensions, scroll horizontally on small screens`} tabIndex={0} className="mt-7 overflow-x-auto border border-line">
      <table className="spec-table min-w-[780px]">
        <caption className="sr-only">All {product.endMill.variants.length} catalog model options for {product.model}; dimensions in mm</caption>
        <thead><tr>{["Model", "D (mm)", "R (mm)", "H (mm)", "L (mm)", "d (mm)", "Flutes", "Reference status"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{product.endMill.variants.map(v => <tr key={v.id}>
          <th scope="row" className="whitespace-nowrap text-left text-xs">{v.model}</th>
          <td>{v.diameter}</td><td>{v.radius ?? "—"}</td><td>{v.fluteLength}</td><td>{v.overallLength}</td><td>{v.shankDiameter}</td><td>{v.flutes}</td>
          <td className="min-w-44 text-xs leading-6">{v.reviewRequired ? `Confirm source code: ${v.reviewNote}` : "Catalog reference"}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="mt-5 text-xs leading-6 text-muted">Original model spellings are retained, including flagged source discrepancies. Confirm the complete ordering specification before purchase. Illustrations are not dimensional drawings.</p>
  </section>;
}
