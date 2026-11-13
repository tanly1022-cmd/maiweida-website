import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Maivida Tech",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function About() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-14 md:py-20">
          <h1 className="max-w-4xl text-4xl text-steel md:text-6xl">
            Precision Carbide Tools, Matched to Your Application
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-muted">
            End mills, drills and inserts from Zhuzhou, with grade, geometry and coating selected for your workpiece — reliable quality, competitive pricing, global delivery.
          </p>
        </Container>
      </section>
      <section aria-labelledby="about-maivida" className="section-space border-b border-line bg-white">
        <Container className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
          <h2 id="about-maivida" className="text-3xl text-steel md:text-4xl">
            About Maivida Tech
          </h2>
          <div className="max-w-3xl space-y-6 text-sm leading-7 text-muted md:text-base">
            <p>
              Maivida Tech Co., Ltd. is a China-based supplier of cemented carbide cutting tools, including end mills, drills and inserts, together with portable spindle balancers and mining equipment. We serve distributors, machining workshops and industrial buyers across Russia, Southeast Asia, Türkiye, Kazakhstan and other overseas markets.
            </p>
            <p>
              We focus on matching the right grade, geometry and coating to your application, rather than supplying catalog stock only. Our team supports you from product selection to after-sales follow-up, aiming for stable machining results and dependable delivery.
            </p>
            <p>
              With direct access to Zhuzhou's carbide supply chain, we keep quality consistent, pricing competitive and lead times reliable. Whether you need standard tools, custom specifications or long-term distributor supply, we are ready to build a partnership that fits your market.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
