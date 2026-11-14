import { InsertReferenceTables } from "./insert-reference-tables";
const workpieces = [
  ["P", "Steel"], ["M", "Stainless steel"], ["K", "Cast iron"],
  ["N", "Non-ferrous metals"], ["S", "Heat-resistant alloys and titanium"], ["H", "Hardened steel"],
];

export function InsertsReference() {
  return <section id="inserts-reference" aria-labelledby="inserts-reference-title" className="technical-panel mb-10 border border-line p-6 md:p-8">
    <div className="max-w-3xl">
      <p className="eyebrow text-muted">Insert technology reference</p>
      <h2 id="inserts-reference-title" className="mt-4 text-2xl md:text-3xl">Geometry first. Grade matched to the workpiece.</h2>
      <p className="mt-4 text-sm leading-7 text-muted">Each card represents a photographed insert geometry or chipbreaker. Choose a model to see its dimensions and its own catalog grade options. Different chipbreakers remain separate, even when the basic insert shape is similar.</p>
    </div>
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div className="min-w-0 overflow-x-auto border border-line bg-white">
        <table className="spec-table w-full">
          <caption className="border-b border-line px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">ISO workpiece groups</caption>
          <thead><tr><th>Group</th><th>Workpiece material</th></tr></thead>
          <tbody>{workpieces.map(([group, material]) => <tr key={group}><td><strong>{group}</strong></td><td>{material}</td></tr>)}</tbody>
        </table>
        <p className="border-t border-line px-5 py-4 text-xs leading-6 text-muted">These are workpiece classifications, not insert substrate or coating claims. A grade must be checked against the selected model and machining conditions.</p>
      </div>
      <div className="flex flex-col border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <h3 className="field-label">Read the grade recommendations</h3>
        <ul className="space-y-3 text-sm leading-6 text-muted">
          <li><span className="mr-2 text-steel" aria-hidden="true">●</span><strong className="font-semibold text-steel">Main recommended</strong> — primary recommendation in the catalog.</li>
          <li><span className="mr-2 text-steel" aria-hidden="true">◐</span><strong className="font-semibold text-steel">General</strong> — general recommendation in the catalog.</li>
          <li><span className="mr-2 text-steel" aria-hidden="true">○</span><strong className="font-semibold text-steel">Available to produce</strong> — confirm suitability and supply before ordering.</li>
        </ul>
        <h3 className="field-label mt-7">Selection workflow</h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>Select the operation in the two-level product directory.</li>
          <li>Compare the real insert photo and chipbreaker designation.</li>
          <li>Choose the model, then a grade listed for that model.</li>
          <li>Open specifications to check the dimensional drawing and send an enquiry.</li>
        </ol>
        <p className="mt-7 border-l-2 border-orange pl-4 text-xs leading-6 text-muted">Blank catalog cells are not offered as grade options. Recommendations do not imply stock availability, guaranteed performance or delivery dates. Include your workpiece, holder and cutting conditions for confirmation.</p>
      </div>
    </div>
    <InsertReferenceTables />
  </section>;
}
