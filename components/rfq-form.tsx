"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { rfqFields, validateRfq, type RfqErrors, type RfqField } from "@/lib/rfq";
import { Arrow } from "./ui";

export function RfqForm({ initialModel = "" }: { initialModel?: string }) {
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<RfqErrors>({});
  const [complete, setComplete] = useState(false);
  const successRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    if (complete) successRef.current?.focus();
    else if (hasSubmitted.current) nameRef.current?.focus();
  }, [complete]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = Object.fromEntries(rfqFields.map(field => [field.name, String(data.get(field.name) ?? "")])) as Record<RfqField, string>;
    const nextErrors = validateRfq(values);
    setErrors(nextErrors);
    const firstInvalid = rfqFields.find(field => nextErrors[field.name]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid.name) as HTMLInputElement | HTMLTextAreaElement | null)?.focus();
      return;
    }

    // DEMO ONLY: no fetch, email, browser storage, or backend submission happens here.
    // Future Formspree integration: POST to a verified NEXT_PUBLIC_FORMSPREE_ENDPOINT;
    // show a delivery confirmation only after the provider returns success.
    // Future Resend integration: call a server-side Route Handler, and read
    // RESEND_API_KEY there. Never add a secret API key to this client component
    // or a NEXT_PUBLIC_* variable. Add server validation and abuse protection too.
    hasSubmitted.current = true;
    setComplete(true);
  }

  if (complete) return (
    <section className="border border-line bg-paper p-7 md:p-10" aria-labelledby="rfq-success">
      <div className="mb-7 flex size-12 items-center justify-center border border-silver" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m5 12 4 4L19 6" /></svg>
      </div>
      <h2 ref={successRef} id="rfq-success" tabIndex={-1} className="text-2xl">Thank you! Your demo enquiry is complete.</h2>
      <p role="status" className="mt-4 max-w-lg text-sm leading-7 text-muted">This is a preview only. No enquiry has been sent or saved, and no email service is connected.</p>
      <button type="button" className="button button-dark mt-8" onClick={() => { setErrors({}); setComplete(false); }}>Try another enquiry <Arrow /></button>
    </section>
  );

  return (
    <form onSubmit={submit} noValidate aria-labelledby="rfq-form-title" aria-describedby="rfq-demo-note rfq-required-note">
      <h2 id="rfq-form-title" className="text-2xl">Your enquiry details</h2>
      <p id="rfq-required-note" className="mt-3 text-sm text-muted">Fields marked * are required. Product model and quantity are optional.</p>
      <div id="rfq-demo-note" className="my-7 border border-line border-l-2 border-l-orange bg-paper p-5 text-sm leading-6">
        <strong className="font-semibold">Demo form</strong> - Preview the enquiry process. Details are not sent or saved. Please do not enter confidential information.
      </div>
      <noscript><p className="mb-6 text-sm">Enable JavaScript to preview this demo form. No submission service is connected.</p></noscript>
      {Object.keys(errors).length > 0 && <p role="alert" className="mb-6 text-sm text-steel">Please check the highlighted fields below.</p>}
      <fieldset disabled={!ready} className="grid min-w-0 gap-x-6 gap-y-6 sm:grid-cols-2">
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
          <button type="submit" className="button button-dark w-full sm:w-auto">Submit demo enquiry <Arrow /></button>
          <p className="mt-4 text-xs leading-6 text-muted">Preview only. This button does not send an email or create a quotation request.</p>
        </div>
      </fieldset>
    </form>
  );
}
