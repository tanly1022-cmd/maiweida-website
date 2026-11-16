import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumbs, Container, Eyebrow, PageIntro } from "@/components/ui";
import { RfqForm } from "@/components/rfq-form";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { RfqQueryForm } from "@/components/rfq-query-form";
import { ContactLinks } from "@/components/contact-links";
import { Icon } from "@/components/icon";

export const metadata: Metadata = pageMetadata(
  "Contact / Request a Quote",
  "Contact Maivida Tech by email or WhatsApp, or send your product model, quantity and machining requirements through the online RFQ form.",
  "/contact/",
);

export default function Contact() {
  return <>
    <PageIntro label="Contact / RFQ" title="Let's talk about your tooling needs.">
      <p>Use the direct contact links, or send your model, quantity and machining requirements using the enquiry form below.</p>
    </PageIntro>
    <Container>
      <Breadcrumbs items={[{ label: "Contact / RFQ" }]} />
      <div className="grid gap-12 pb-20 pt-5 lg:grid-cols-[.8fr_1.6fr] lg:gap-20">
        <aside aria-labelledby="enquiry-guide" className="lg:border-r lg:border-line lg:pr-12">
          <Eyebrow>Contact us directly</Eyebrow>
          <h2 id="enquiry-guide" className="mt-5 text-2xl leading-snug">{site.company}</h2>
          <div className="mt-5 border-b border-line pb-7">
            <ContactLinks />
            <address className="mt-5 flex items-start gap-3 text-sm leading-7 not-italic text-muted"><Icon name="pin" className="mt-1 text-steel" /><span><span className="sr-only">Address: </span>{site.address}</span></address>
          </div>
          <h3 className="mt-7 text-lg">A focused tooling enquiry.</h3>
          <p className="mt-5 text-sm leading-7 text-muted">Use the product model exactly as listed in the catalog. If you are still choosing a tool, leave the model blank and describe the task.</p>
          <h3 className="mt-9 text-sm font-semibold">Useful details to include</h3>
          <ul className="mt-4 space-y-4 text-sm leading-6 text-muted">
            {["Workpiece material and machining operation", "Machine interface and existing tool reference", "Required dimensions, tolerances and quantity"].map(text => <li key={text} className="flex items-start gap-3"><span className="mt-2 size-1 shrink-0 bg-orange" aria-hidden="true" />{text}</li>)}
          </ul>
          <div className="mt-9 border-t border-line pt-6 text-sm leading-6 text-muted">
            <p>Specifications, availability and suitability require confirmation before ordering.</p>
            <Link href="/products" className="mt-5 inline-block text-steel underline decoration-orange underline-offset-4">Return to the product catalog</Link>
          </div>
        </aside>
        <Suspense fallback={<RfqForm />}><RfqQueryForm /></Suspense>
      </div>
    </Container>
  </>;
}
