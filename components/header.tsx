"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Arrow } from "./ui";
import { Icon, type IconName } from "./icon";
import { MaividaLogo } from "./maivida-logo";
import { ContactLinks } from "./contact-links";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/products", label: "Products", icon: "catalog" },
  { href: "/industries", label: "Industries", icon: "industry" },
  { href: "/about", label: "About", icon: "about" },
  { href: "/contact", label: "Contact", icon: "contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); document.getElementById("menu-toggle")?.focus(); }
    }
    if (open) document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return <header className="site-header border-b border-line bg-white">
    <div className="border-b border-line bg-paper">
      <div className="shell flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        <p className="hidden text-[10px] font-medium uppercase tracking-[.12em] text-muted md:block">Tooling enquiries / Direct contact</p>
        <ContactLinks inline />
      </div>
    </div>
    <div className="shell flex min-h-21 flex-wrap items-center justify-between gap-x-3 md:gap-x-6 xl:flex-nowrap">
      <Link href="/" aria-label="MAIVIDA home" onClick={() => setOpen(false)} className="brand max-w-[calc(100%-3.5rem)] xl:max-w-none"><MaividaLogo /></Link>
      <button id="menu-toggle" className="icon-label flex size-11 shrink-0 items-center justify-center border border-line xl:hidden" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
        <Icon name={open ? "close" : "menu"} className="size-5" /><span className="sr-only">{open ? "Close menu" : "Menu"}</span>
      </button>
      <nav id="main-navigation" aria-label="Main navigation" className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 border-t border-line py-4 xl:flex xl:w-auto xl:flex-row xl:items-center xl:gap-6 xl:border-0 xl:py-0`}>
        {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={pathname.startsWith(link.href) ? "page" : undefined} className="nav-link icon-label flex min-h-11 items-center gap-2 py-3 text-sm"><Icon name={link.icon} /><span>{link.label}</span></Link>)}
        <Link href="/contact" onClick={() => setOpen(false)} className="button button-dark my-2 xl:my-0"><span className="inline-flex items-center gap-2"><Icon name="quote" />Request a Quote</span><Arrow /></Link>
      </nav>
    </div>
  </header>;
}
