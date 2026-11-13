import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumbs, Container, Eyebrow, PageIntro } from "@/components/ui";
import { RfqForm } from "@/components/rfq-form";
import { absoluteUrl, site } from "@/lib/site";
import { RfqQueryForm } from "@/components/rfq-query-form";

export const metadata: Metadata = {
  title: "Contact / Request a Quote",
  description: "Send the MAIVIDA sales team your product model, quantity and machining requirements through the online RFQ form.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: "Contact / Request a Quote | MAIVIDA",
    description: "A model. A requirement. Send a specification-led tooling enquiry to the MAIVIDA sales team.",
    ...(absoluteUrl("/contact") ? { url: absoluteUrl("/contact") } : {}),
  },
};

export default function Contact() {
  return <>
    <PageIntro label="Contact / RFQ" title="Start with your requirement.">
      <p>A model number, a quantity, a machining task. Bring the details together for a more precise tooling enquiry.</p>
    </PageIntro>
    <Container>
      <Breadcrumbs items={[{ label: "Contact / RFQ" }]} />
      <div className="grid gap-12 pb-20 pt-5 lg:grid-cols-[.8fr_1.6fr] lg:gap-20">
        <aside aria-labelledby="enquiry-guide" className="lg:border-r lg:border-line lg:pr-12">
          <Eyebrow>Request a Quote</Eyebrow>
          <h2 id="enquiry-guide" className="mt-5 text-2xl leading-snug">Clear details.<br />A focused conversation.</h2>
          <p className="mt-5 text-sm leading-7 text-muted">Use the product model exactly as listed in the catalog. If you are still choosing a tool, leave the model blank and describe the task.</p>
          <h3 className="mt-9 text-sm font-semibold">Useful details to include</h3>
          <ul className="mt-4 space-y-4 text-sm leading-6 text-muted">
            {["Workpiece material and machining operation", "Machine interface and existing tool reference", "Required dimensions, tolerances and quantity"].map(text => <li key={text} className="flex items-start gap-3"><span className="mt-2 size-1 shrink-0 bg-orange" aria-hidden="true" />{text}</li>)}
          </ul>
          <div className="mt-9 border-t border-line pt-6 text-sm leading-6 text-muted">
            <p>Specifications, availability and suitability require confirmation before ordering.</p>
            {site.email && <a href={`mailto:${site.email}`} className="mt-5 block break-all text-steel underline underline-offset-4">{site.email}</a>}
            <Link href="/products" className="mt-5 inline-block text-steel underline decoration-orange underline-offset-4">Return to the product catalog</Link>
          </div>
        </aside>
        <Suspense fallback={<RfqForm />}><RfqQueryForm /></Suspense>
      </div>
    </Container>
  </>;
}
