import Link from "next/link";
import { site } from "@/lib/site";
import { Container } from "./ui";
import { ContactLinks } from "./contact-links";
import { Icon } from "./icon";
import { END_MILLS_PATH } from "@/lib/end-mill-catalog";

export function Footer() {
  return <footer className="border-t border-line bg-white">
    <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
      <div>
        <Link href="/" className="font-display text-2xl font-bold tracking-[.05em]">MAIVIDA<span className="text-orange">.</span></Link>
        <p className="mt-5 max-w-xs text-sm leading-6 text-muted">Cutting tools. Clear requirements.<br />A more considered tooling enquiry.</p>
      </div>
      <div>
        <h2 className="footer-heading">Explore</h2>
        <ul className="footer-links">
          <li><Link href="/products" className="icon-label inline-flex min-h-9 items-center gap-2"><Icon name="catalog" />Product catalog</Link></li>
          <li><Link href={END_MILLS_PATH} className="icon-label inline-flex min-h-9 items-center gap-2"><Icon name="milling" />Solid carbide end mills</Link></li>
          <li><Link href="/industries" className="icon-label inline-flex min-h-9 items-center gap-2"><Icon name="industry" />Industries</Link></li>
          <li><Link href="/about" className="icon-label inline-flex min-h-9 items-center gap-2"><Icon name="about" />About MAIVIDA</Link></li>
        </ul>
      </div>
      <div>
        <h2 className="footer-heading">Enquiries</h2>
        <ul className="footer-links">
          <li><Link href="/contact" className="icon-label inline-flex min-h-9 items-center gap-2"><Icon name="quote" />Request a Quote</Link></li>
          <li><Link href="/about#quality" className="icon-label inline-flex min-h-9 items-center gap-2"><Icon name="shield" />Quality & inspection</Link></li>
          <li><Link href="/#faq" className="icon-label inline-flex min-h-9 items-center gap-2"><Icon name="help" />Frequently asked questions</Link></li>
        </ul>
      </div>
      <div>
        <h2 className="footer-heading">Contact us</h2>
        <p className="mt-4 text-sm leading-6 text-muted">{site.company}</p>
        <div className="mt-4"><ContactLinks /></div>
        <address className="mt-4 flex items-start gap-2 text-xs leading-6 not-italic text-muted"><Icon name="pin" className="mt-1 text-steel" /><span><span className="sr-only">Address: </span>{site.address}</span></address>
        <Link href="/contact" className="icon-label mt-4 inline-flex min-h-9 items-center gap-2 text-sm underline underline-offset-4"><Icon name="quote" />Request a Quote</Link>
      </div>
    </Container>
    <Container className="flex flex-wrap justify-between gap-3 border-t border-line py-6 text-xs text-muted"><p>&copy; {new Date().getFullYear()} MAIVIDA. All rights reserved.</p><p>Catalog references &middot; Confirm specifications before ordering.</p></Container>
  </footer>;
}
