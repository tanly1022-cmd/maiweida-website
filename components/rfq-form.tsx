"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { rfqFields, validateRfq, type RfqErrors, type RfqField } from "@/lib/rfq";
import { Arrow } from "./ui";

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim() || "https://formspree.io/f/xjywkpzg";
const GENERIC_SUBMISSION_ERROR = "We could not send your enquiry. Please try again.";

type FormspreeResponse = { message?: string; errors?: Array<{ message?: string }> };

export function RfqForm({ initialModel = "" }: { initialModel?: string }) {
  const [errors, setErrors] = useState<RfqErrors>({});
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const successRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (complete) successRef.current?.focus();
    else if (hasSubmitted.current) nameRef.current?.focus();
  }, [complete]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const values = Object.fromEntries(rfqFields.map(field => [field.name, String(data.get(field.name) ?? "")])) as Record<RfqField, string>;
    const nextErrors = validateRfq(values);
    setErrors(nextErrors);
    setSubmitError("");
    const firstInvalid = rfqFields.find(field => nextErrors[field.name]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid.name) as HTMLInputElement | HTMLTextAreaElement | null)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      const result = await response.json().catch(() => null) as FormspreeResponse | null;
      if (!response.ok) {
        const providerMessage = result?.message || result?.errors?.map(error => error.message).filter(Boolean).join(" ");
        throw new Error(providerMessage || GENERIC_SUBMISSION_ERROR);
      }
      hasSubmitted.current = true;
      setComplete(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : GENERIC_SUBMISSION_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  if (complete) return (
    <section className="border border-line bg-paper p-7 md:p-10" aria-labelledby="rfq-success">
      <div className="mb-7 flex size-12 items-center justify-center border border-silver" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m5 12 4 4L19 6" /></svg>
      </div>
      <h2 ref={successRef} id="rfq-success" tabIndex={-1} className="text-2xl">Thank you! Your enquiry has been sent.</h2>
      <p role="status" className="mt-4 max-w-lg text-sm leading-7 text-muted">The MAIVIDA sales team will review your details and contact you at the email address provided.</p>
      <button type="button" className="button button-dark mt-8" onClick={() => { setErrors({}); setSubmitError(""); setComplete(false); }}>Send another enquiry <Arrow /></button>
    </section>
  );

  return (
    <form action={FORMSPREE_ENDPOINT} method="POST" onSubmit={submit} aria-labelledby="rfq-form-title" aria-describedby="rfq-provider-note rfq-required-note">
      <h2 id="rfq-form-title" className="text-2xl">Your enquiry details</h2>
      <p id="rfq-required-note" className="mt-3 text-sm text-muted">Fields marked * are required. Product model and quantity are optional.</p>
      <div id="rfq-provider-note" className="my-7 border border-line border-l-2 border-l-orange bg-paper p-5 text-sm leading-6">
        <strong className="font-semibold">Request a Quote</strong> - Your details will be sent to the MAIVIDA sales team through Formspree.
      </div>
      <noscript><p className="mb-6 text-sm">JavaScript is required for inline validation and confirmation. The form will still submit to Formspree.</p></noscript>
      {Object.keys(errors).length > 0 && <p role="alert" className="mb-6 text-sm text-steel">Please check the highlighted fields below.</p>}
      {submitError && <p role="alert" className="mb-6 border border-orange p-4 text-sm leading-6 text-steel">{submitError}</p>}
      <input type="hidden" name="_subject" value="MAIVIDA website RFQ enquiry" />
      <fieldset className="grid min-w-0 gap-x-6 gap-y-6 sm:grid-cols-2">
        <legend className="sr-only">Contact and product information</legend>
        {rfqFields.map(field => {
          const error = errors[field.name];
          const id = `rfq-${field.name}`;
          const shared = { id, name: field.name, required: field.required, maxLength: field.maxLength, autoComplete: field.autoComplete, className: "input", "aria-invalid": error ? true as const : undefined, "aria-describedby": error ? `${id}-error` : undefined };
          return <div key={field.name} className={field.name === "message" ? "sm:col-span-2" : "min-w-0"}>
            <label htmlFor={id} className="field-label">{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>
            {field.name === "message" ? <textarea {...shared} rows={6} className="input resize-y" placeholder="Describe the workpiece, machining operation, and any requirements." /> : <input {...shared} ref={field.name === "name" ? nameRef : undefined} type={field.name === "email" ? "email" : "text"} inputMode={field.name === "quantity" ? "numeric" : undefined} defaultValue={field.name === "model" ? initialModel : undefined} placeholder={field.name === "model" ? "Model or family reference, if known" : field.name === "quantity" ? "e.g. 10" : undefined} />}
            {error && <p id={`${id}-error`} className="field-error">{error}</p>}
          </div>;
        })}
        <div className="border-t border-line pt-7 sm:col-span-2">
          <button type="submit" disabled={submitting} className="button button-dark w-full sm:w-auto">{submitting ? "Sending..." : "Submit enquiry"} <Arrow /></button>
          <p className="mt-4 text-xs leading-6 text-muted">Your enquiry is submitted through Formspree to the configured MAIVIDA sales inbox.</p>
        </div>
      </fieldset>
    </form>
  );
}
