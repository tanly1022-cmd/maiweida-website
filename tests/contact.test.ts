import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContactLinks } from "../components/contact-links";
import { Footer } from "../components/footer";
import { site } from "../lib/site";

function withWhatsApp(value: string | undefined, run: () => void) {
  const previous = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  try {
    if (value === undefined) delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    else process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = value;
    run();
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    else process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = previous;
  }
}

test("business email is visible by default and seller identity is consistent", () => {
  assert.equal(site.email, process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "sales@maivida.com");
  assert.equal(site.company, "Maivida Tech Co., Ltd.");
  assert.equal("contactName" in site, false);
  assert.equal(site.address, "Building 6, Guanshen Intelligent Manufacturing Technology Equipment City, Zhuzhou, Hunan, China");
  const html = renderToStaticMarkup(createElement(ContactLinks));
  assert.ok(html.includes(`href="mailto:${site.email}"`));
  assert.ok(html.includes(site.email));
});

test("shared contact links show the WhatsApp number with safe external navigation", () => {
  withWhatsApp(undefined, () => {
    for (const inline of [true, false]) {
      const html = renderToStaticMarkup(createElement(ContactLinks, { inline }));
      assert.match(html, /href="https:\/\/wa\.me\/8618673309556"/);
      assert.match(html, /\+86 186 7330 9556/);
      assert.match(html, /target="_blank" rel="noopener noreferrer"/);
      assert.match(html, /opens in a new tab/);
      assert.match(html, inline ? /flex-wrap/ : /flex-col items-start/);
    }
  });
});

test("contact text and destination stay matched for valid and invalid WhatsApp overrides", () => {
  for (const [override, number, label] of [["12345678901", "12345678901", "+12345678901"], ["javascript:alert(1)", "8618673309556", "+86 186 7330 9556"], ["", "8618673309556", "+86 186 7330 9556"]]) {
    withWhatsApp(override, () => {
      const html = renderToStaticMarkup(createElement(ContactLinks));
      assert.ok(html.includes(`href="https://wa.me/${number}"`));
      assert.ok(html.includes(label));
      assert.doesNotMatch(html, /javascript:/);
    });
  }
});

test("footer exposes seller, email, WhatsApp and the existing enquiry form", () => {
  const html = renderToStaticMarkup(createElement(Footer));
  assert.match(html, /Contact us/);
  assert.ok(html.includes(site.company));
  assert.ok(html.includes(site.address));
  assert.match(html, /Address:/);
  assert.doesNotMatch(html, /Kian|Your contact:|Contact:/);
  assert.ok(html.includes(`href="mailto:${site.email}"`));
  assert.match(html, /href="https:\/\/wa\.me\//);
  assert.match(html, /href="\/contact"/);
});

test("global header and Contact page expose shared direct contacts without changing RFQ", () => {
  const header = readFileSync("components/header.tsx", "utf8");
  const page = readFileSync("app/contact/page.tsx", "utf8");
  assert.match(header, /<ContactLinks inline \/>/);
  assert.match(header, /flex-wrap/);
  assert.match(page, /Contact us directly/);
  assert.match(page, /<ContactLinks \/>/);
  assert.doesNotMatch(page, /site.contactName|Kian|Your contact:/);
  assert.match(page, /site.address/);
  assert.match(page, /Address:/);
  assert.match(page, /<Suspense fallback=\{<RfqForm \/>\}><RfqQueryForm \/><\/Suspense>/);
});

test("contact links keep the messaging icon and number without a visible platform label", () => {
  const html = renderToStaticMarkup(createElement(ContactLinks));
  assert.match(html, /data-icon="whatsapp"/);
  assert.match(html, /aria-label="WhatsApp /);
  assert.doesNotMatch(html.replace(/<[^>]*>/g, ""), /WhatsApp|Kian/);
});

test("key headings use locally hosted Inter bold without changing regular body typography", () => {
  const layout = readFileSync("app/layout.tsx", "utf8");
  const css = readFileSync("app/globals.css", "utf8");
  assert.ok(layout.includes('@fontsource/inter/latin-700.css'));
  assert.ok(css.includes('--font-display: "Inter", "Helvetica Neue", Arial, sans-serif;'));
  assert.ok(css.includes('h1, h2, h3 { font-family: var(--font-display); font-weight: 700;'));
  assert.ok(css.includes('body { margin: 0; background: white; color: #2B2F36; font-family: var(--font-sans);'));
  assert.ok(!layout.includes('@fontsource/montserrat'));
});


test("uppercase is limited to navigation and short labels, not headings or product categories", () => {
  const css = readFileSync("app/globals.css", "utf8");
  for (const selector of [".nav-link", ".eyebrow", ".footer-heading"]) {
    const rule = css.split(selector + " {")[1]?.split("}")[0];
    assert.ok(rule?.includes("text-transform: uppercase;"), selector);
    assert.ok(rule?.includes("letter-spacing:"), selector);
  }
  for (const rule of css.split("}")) {
    if (!rule.includes("text-transform:")) continue;
    assert.ok(rule.trim().startsWith(".nav-link {") || rule.trim().startsWith(".eyebrow {") || rule.trim().startsWith(".footer-heading {"));
  }
  const sidebar = readFileSync("components/category-sidebar.tsx", "utf8");
  assert.ok(!sidebar.includes("uppercase"));
  assert.ok(!sidebar.includes("toUpperCase"));
});
