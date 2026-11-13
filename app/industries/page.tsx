import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Industries",
  alternates: { canonical: absoluteUrl("/industries") },
};

export default function Industries() {
  return (
    <section className="section-space border-b border-line">
      <Container>
        <article aria-labelledby="industry-introduction" className="max-w-4xl">
          <Eyebrow>Industries</Eyebrow>
          <h1 id="industry-introduction" className="mt-5 text-3xl text-steel md:text-4xl">
            Cemented Carbide Tools 2026: Value, Service and Regional Diversification
          </h1>
          <div className="mt-8 max-w-3xl space-y-5 text-sm leading-7 text-muted md:text-base">
            <p>
              China's carbide exports held steady growth in H1 2026: export value reached about{" "}
              <strong className="font-semibold text-steel">USD 667 million, up 13.4% YoY</strong>,
              average unit price rose <strong className="font-semibold text-steel">14.6%</strong>,
              and high-end CNC inserts now make up{" "}
              <strong className="font-semibold text-steel">42.8%</strong> of exports.
            </p>
            <p>
              The market is shifting from pure price competition to machining solutions. Buyers
              want reliable results and technical support — grade, geometry and coating matched
              to their workpiece — not just catalog tools.
            </p>
            <p>
              Growth is fastest in emerging markets:{" "}
              <strong className="font-semibold text-steel">ASEAN shipments rose 34.7%</strong>,
              while Russia, Türkiye and Kazakhstan remain strong outlets for cost-competitive
              carbide end mills, drills and inserts.
            </p>
            <p>
              Raw-material price gaps and anti-dumping measures mean sourcing should be planned
              by destination and compliance reviewed early.
            </p>
            <p className="border-t border-line pt-6">
              <strong className="font-semibold text-steel">Need a reliable carbide tool partner?</strong>{" "}
              Send us your workpiece and machine details — we will recommend the right grade
              and quote for your market.
            </p>
          </div>
        </article>
      </Container>
    </section>
  );
}
