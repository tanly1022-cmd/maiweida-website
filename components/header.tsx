"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Arrow } from "./ui";
const links = [{ href: "/products", label: "Products" }, { href: "/industries", label: "Industries" }, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { function close(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); document.getElementById("menu-toggle")?.focus(); } } if (open) document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [open]);
  return <header className="site-header border-b border-line bg-white"><div className="shell flex min-h-21 flex-wrap items-center justify-between gap-x-8"><Link href="/" aria-label="MAIWEIDA home" onClick={() => setOpen(false)} className="brand flex items-center gap-3"><span className="brand-mark" aria-hidden="true"><span /></span><span>MAIWEIDA<span className="mt-1 block font-sans text-[9px] font-medium tracking-[.23em] text-muted">CUTTING TOOLS & TOOLHOLDING</span></span></Link><button id="menu-toggle" className="border border-line px-4 py-2 text-sm lg:hidden" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? "Close menu" : "Menu"}</button><nav id="main-navigation" aria-label="Main navigation" className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 border-t border-line py-4 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-8 lg:border-0 lg:py-0`}>{links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={pathname.startsWith(link.href) ? "page" : undefined} className="nav-link py-3 text-sm">{link.label}</Link>)}<Link href="/contact" onClick={() => setOpen(false)} className="button button-dark my-2 lg:my-0 lg:ml-4">Request a Quote <Arrow /></Link></nav></div></header>;
}
