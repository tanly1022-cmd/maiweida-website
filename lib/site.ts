export const site = {
  name: "MAIVIDA",
  description: "Explore the MAIVIDA model catalog and send a specification-led tooling enquiry. Share your workpiece, machine interface and machining requirements.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
};
function getOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return undefined;
  try { const url = new URL(configured); return ["https:", "http:"].includes(url.protocol) ? url.origin : undefined; } catch { return undefined; }
}
export const siteOrigin = getOrigin();
export function absoluteUrl(path: string) { return siteOrigin ? new URL(path, siteOrigin).toString() : undefined; }
export function rfqHref(model?: string) { return model ? `/contact?model=${encodeURIComponent(model)}` : "/contact"; }
export const industries = [
  { id: "automotive", number: "01", title: "Automotive", focus: "Repeatable processes start with a defined requirement.", description: "For an automotive machining enquiry, identify the component, workpiece material and operation. Include the machine interface, drawing tolerances and the current tooling setup so the discussion stays specific.", checks: ["Component and operation", "Material and tolerance", "Machine and tool interface"] },
  { id: "mold", number: "02", title: "Mold & die", focus: "Make reach, access and finish part of the brief.", description: "Deep cavities and detailed features call for a clear description of access and overhang. Share the intended operation, material condition and finish requirement before discussing a tooling choice.", checks: ["Cavity access and reach", "Material condition", "Surface finish requirement"] },
  { id: "aerospace", number: "03", title: "Aerospace", focus: "Put application requirements before product selection.", description: "Specify the exact workpiece grade, process constraints and documentation required for your enquiry. Suitability, traceability and any project-specific approvals must be confirmed for the individual item; they are not implied by this catalog.", checks: ["Exact workpiece grade", "Process constraints", "Required documentation"] },
  { id: "machinery", number: "04", title: "General machinery", focus: "Connect the model to the job on the machine.", description: "For mixed production or a replacement toolholding enquiry, send the existing model reference and machine connection details. Add the working envelope and operation so alternatives can be discussed against the same brief.", checks: ["Existing model reference", "Connection and envelope", "Operation and quantity"] },
  { id: "energy", number: "05", title: "Energy", focus: "Define the component, conditions and acceptance checks.", description: "Share the component drawing, workpiece material and intended machining operation. State any inspection or documentation requirements explicitly. Product suitability and the scope of supply need individual confirmation.", checks: ["Component and material", "Machining operation", "Acceptance requirements"] },
];
export const faqs = [
  { question: "How do I request a quotation?", answer: "Select a catalog model or open the RFQ form. Include the quantity, workpiece material, machine interface and machining requirement. Commercial terms and availability need confirmation for your enquiry." },
  { question: "Can I enquire if I do not have a model number?", answer: "Yes. Describe the operation and the machine connection in the RFQ form. A drawing or an existing model reference can help define what needs to be checked. No product suitability is assumed from the description alone." },
  { question: "Are the catalog specifications final ordering specifications?", answer: "Use the catalog as a reference. Entries marked for specification confirmation must be checked before ordering. Confirm the complete model, dimensions, units and required configuration in writing." },
  { question: "Where can I find product drawings or an English PDF?", answer: "Approved files will appear on the relevant product page when available. If no download is listed, request the drawing or English documentation with your model enquiry." },
];
