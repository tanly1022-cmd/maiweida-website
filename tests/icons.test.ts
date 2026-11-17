import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Icon, categoryIcon, type IconName } from "../components/icon";
import { ContactLinks } from "../components/contact-links";
import { CategorySidebar } from "../components/category-sidebar";
import { Footer } from "../components/footer";
import { RfqForm } from "../components/rfq-form";

const render = renderToStaticMarkup;

test("shared icons use a consistent stroke and stay outside the accessibility tree", () => {
  const names: IconName[] = ["catalog", "industry", "about", "contact", "quote", "mail", "whatsapp", "pin", "menu", "close", "search", "shield", "help", "turning", "milling", "boring", "drilling", "insert", "tooling", "accessories"];
  for (const name of names) {
    const html = render(createElement(Icon, { name }));
    assert.ok(html.includes('data-icon="' + name + '"'));
    assert.match(html, /aria-hidden="true"/);
    assert.match(html, /focusable="false"/);
    assert.match(html, /viewBox="0 0 24 24"/);
    assert.match(html, /stroke="currentColor"/);
    assert.match(html, /stroke-width="1.6"/);
    assert.doesNotMatch(html, /tabindex|<img|<image|https?:/);
  }
});

test("all catalog parent types have tool-specific icons with a safe generic fallback", () => {
  const parents = JSON.parse(readFileSync("data/categories.json", "utf8")) as { id: string }[];
  assert.deepEqual(parents.map(parent => categoryIcon(parent.id)), ["turning", "milling", "milling", "boring", "drilling", "insert", "tooling", "accessories"]);
  assert.equal(categoryIcon("future-category"), "catalog");
});

test("sidebar icons decorate only parent links without changing filters or child labels", () => {
  const html = render(createElement(CategorySidebar, { categories: [{ id: "cnc-inserts", name: "CNC Inserts", count: 2, children: [{ id: "turning-inserts", name: "Turning inserts", count: 2 }] }], selected: "Turning inserts", query: "CNMG", total: 2 }));
  assert.equal((html.match(/data-icon=/g) ?? []).length, 2);
  assert.match(html, /data-icon="insert"/);
  assert.match(html, /CNC Inserts/);
  assert.match(html, /Turning inserts/);
  assert.ok(html.includes("category=CNC+Inserts"));
  assert.ok(html.includes("category=Turning+inserts"));
  assert.match(html, /q=CNMG/);
  assert.match(html, /aria-expanded="true"/);
});

test("contact and quote icons retain contact text, link destinations and RFQ actions", () => {
  const links = render(createElement(ContactLinks));
  assert.match(links, /data-icon="mail"/);
  assert.match(links, /data-icon="whatsapp"/);
  assert.match(links, /mailto:/);
  assert.match(links, /Email: /);
  assert.match(links, /aria-label="WhatsApp /);
  assert.doesNotMatch(links.replace(/<[^>]*>/g, ""), /WhatsApp/);
  const footer = render(createElement(Footer));
  assert.match(footer, /data-icon="pin"/);
  assert.match(footer, /Address:/);
  for (const label of ["Product catalog", "Industries", "About MAIVIDA", "Quality &amp; inspection", "Frequently asked questions", "Request a Quote"]) assert.ok(footer.includes(label));
  const form = render(createElement(RfqForm));
  assert.match(form, /data-icon="quote"/);
  assert.match(form, /Submit enquiry/);
  assert.match(form, /type="submit"/);
});

test("header keeps named navigation and keyboard-operable responsive menu", () => {
  const header = readFileSync("components/header.tsx", "utf8");
  for (const icon of ["catalog", "industry", "about", "contact"]) assert.ok(header.includes('icon: "' + icon + '"'));
  assert.match(header, /aria-controls="main-navigation"/);
  assert.ok(header.includes("aria-expanded={open}"));
  assert.match(header, /Close menu/);
  assert.match(header, /event.key === "Escape"/);
  assert.match(header, /sr-only/);
  assert.match(header, /xl:flex-row/);
});
