import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { rfqFields, rfqModel, validateRfq, type RfqField } from "../lib/rfq";
import { RfqForm } from "../components/rfq-form";

const valid: Record<RfqField, string> = { name: "Alex Example", company: "Example Manufacturing", email: "alex@example.com", country: "United States", model: "MRGNR/L", quantity: "10", message: "Preview enquiry for a turning operation." };

test("RFQ form contains exactly the seven requested fields and a model prefill", () => {
  assert.deepEqual(rfqFields.map(field => field.label), ["Name", "Company", "Email", "Country", "Product Model", "Quantity", "Message"]);
  const html = renderToStaticMarkup(createElement(RfqForm, { initialModel: "PCBNR/L" }));
  for (const field of rfqFields) {
    assert.ok(html.includes(`name="${field.name}"`));
    assert.ok(html.includes(`for="rfq-${field.name}"`));
  }
  assert.match(html, /value="PCBNR\/L"/);
  assert.match(html, /Demo form/);
  assert.match(html, /Details are not sent or saved/);
  assert.match(html, /<fieldset disabled=""/); // No accidental native GET before hydration.
});

test("RFQ required fields, email, quantity and length use English validation", () => {
  assert.deepEqual(validateRfq(valid), {});
  assert.deepEqual(validateRfq({ ...valid, model: "", quantity: "" }), {});
  const empty = Object.fromEntries(rfqFields.map(field => [field.name, "   "])) as Record<RfqField, string>;
  assert.deepEqual(Object.keys(validateRfq(empty)), ["name", "company", "email", "country", "message"]);
  for (const quantity of ["0", "-3", "1.5", "1e3", "ten", "99999999999"]) assert.ok(validateRfq({ ...valid, quantity }).quantity);
  assert.ok(validateRfq({ ...valid, email: "not-an-email" }).email);
  assert.ok(validateRfq({ ...valid, message: "x".repeat(5001) }).message);
});

test("RFQ query prefill hides TBD, bilingual references and repeated query values", () => {
  for (const value of ["TBD", "", undefined, ["MRGNR/L"], "\u4e2d\u6587"]) assert.equal(rfqModel(value), "");
  assert.equal(rfqModel("MRGNR/L"), "MRGNR/L");
  assert.equal(rfqModel("PCBNR/L\n"), "PCBNR/L");
  assert.equal(rfqModel("x".repeat(250)).length, 200);
});

test("demo has no transmission, storage, fake delivery or response-time promises", () => {
  const code = readFileSync("components/rfq-form.tsx", "utf8");
  assert.doesNotMatch(code, /\bfetch\s*\(|localStorage|sessionStorage|24 hours/);
  assert.match(code, /no enquiry has been sent/i);
  assert.match(code, /RESEND_API_KEY/);
});
