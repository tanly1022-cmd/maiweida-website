import type { Metadata } from "next";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { site, siteOrigin } from "@/lib/site";
export const metadata: Metadata = {
  ...(siteOrigin ? { metadataBase: new URL(siteOrigin) } : {}),
  title: { default: "MAIWEIDA | Carbide Cutting Tools & CNC Toolholding Supplier", template: "%s | MAIWEIDA" },
  description: site.description,
  applicationName: "MAIWEIDA",
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "en_US", siteName: "MAIWEIDA", title: "MAIWEIDA | Carbide Cutting Tools & CNC Toolholding Supplier", description: site.description, ...(siteOrigin ? { url: siteOrigin, images: [{ url: "/images/og-cover.png", width: 1200, height: 630, alt: "MAIWEIDA — Cutting tools. Clear requirements." }] } : {}) },
  twitter: { card: "summary_large_image", title: "MAIWEIDA | Carbide Cutting Tools & CNC Toolholding Supplier", description: site.description, ...(siteOrigin ? { images: ["/images/og-cover.png"] } : {}) },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><a href="#main" className="skip-link">Skip to main content</a><Header /><main id="main" tabIndex={-1}>{children}</main><Footer /><WhatsAppButton /></body></html>; }
