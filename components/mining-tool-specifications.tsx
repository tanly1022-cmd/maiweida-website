import Image from "next/image";
import type { Product } from "@/lib/catalog-core";

export function MiningToolSpecifications({ product, selectedVariantId }: { product: Product; selectedVariantId?: string }) {
  const series = product.miningTool;
  if (!series) return null;
  return <section aria-labelledby="mining-specifications" className="mb-16 border-t border-line pt-9">
    <p className="text-xs uppercase tracking-widest text-muted">Geometry & catalog dimensions</p>
    <h2 id="mining-specifications" className="mt-4 text-2xl md:text-3xl">{product.model}</h2>
    <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">Each row is an original catalog option. Linear dimensions are in mm; angles are in degrees. Letter case and drawing symbols are retained from the catalog.</p>
    {product.drawing && <figure className="mt-7 w-full max-w-xl border border-line bg-white p-6">
      <Image src={product.drawing} width={600} height={360} unoptimized className="mx-auto h-auto max-h-80 w-auto max-w-full object-scale-down" alt={`Catalog dimension drawing for ${product.model}`} />
      <figcaption className="mt-4 text-xs leading-6 text-muted">Representative dimension drawing. Use the selected model row for values; not to scale.</figcaption>
    </figure>}
    {series.sourceNote && <p className="mt-5 border-l-2 border-steel pl-4 text-xs leading-6 text-muted">Source clarification: {series.sourceNote}</p>}
    <div role="region" aria-label={`${product.model} dimensions, scroll horizontally on small screens`} tabIndex={0} className="mt-7 overflow-x-auto border border-line">
      <table className="spec-table min-w-[740px]">
        <caption className="sr-only">All {series.variants.length} model options for {product.model}</caption>
        <thead><tr><th scope="col">Model</th>{series.columns.map(c => <th scope="col" key={c.label}>{c.label} ({c.unit})</th>)}<th scope="col">Reference status</th></tr></thead>
        <tbody>{series.variants.map(v => <tr key={v.id} className={v.id === selectedVariantId ? "bg-paper" : undefined} data-selected={v.id === selectedVariantId ? "true" : undefined}>
          <th scope="row" className="whitespace-nowrap text-left text-xs">{v.model}</th>
          {v.values.map((value, i) => <td key={series.columns[i].label}>{value}</td>)}
          <td className="min-w-52 text-xs leading-6">{v.reviewRequired ? `Confirm source: ${v.reviewNote}` : series.sourceNote ? "Confirm table / drawing labels" : "Catalog reference"}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="mt-5 text-xs leading-6 text-muted">Source discrepancies are flagged rather than silently corrected. Confirm the complete model, dimensions, grade and application before ordering.</p>
  </section>;
}
