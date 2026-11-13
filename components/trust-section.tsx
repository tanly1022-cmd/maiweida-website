import { Container, Eyebrow } from "./ui";

const priorities = [
  { title: "Fast Global Shipping", description: "Share your destination and required delivery date. Shipping options and timing need confirmation for your order.", icon: "shipping" },
  { title: "Strict Quality Control", description: "Specify critical dimensions, acceptance criteria and required inspection records with your enquiry.", icon: "quality" },
  { title: "Custom Tooling Solutions", description: "Send a drawing and application brief to request a review of custom tooling feasibility.", icon: "custom" },
  { title: "Engineering Support", description: "Include the workpiece, machine interface and operation to define the technical review you need.", icon: "support" },
] as const;

function PriorityIcon({ type }: { type: typeof priorities[number]["icon"] }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter" className="size-9 text-steel" aria-hidden="true" focusable="false">
    {type === "shipping" && <><path d="M3 8h17v16H3zM20 14h5l4 5v5h-9M7 5h10M2 13h7" /><circle cx="9" cy="25" r="3" fill="white" /><circle cx="24" cy="25" r="3" fill="white" /></>}
    {type === "quality" && <><path d="m16 3 11 4v9c0 7-11 13-11 13S5 23 5 16V7z" /><path d="m10 15 4 4 8-9" /></>}
    {type === "custom" && <><path d="M5 5h22v22H5zM5 12h22M12 5v22M18 18h5v5h-5zM8 8h1M16 8h1M21 8h1" /></>}
    {type === "support" && <><path d="M5 17v-3a11 11 0 0 1 22 0v3M5 15H3v9h6v-9H5ZM27 15h2v9h-6v-9h4ZM27 24v3H17" /><path d="M13 25h6v4h-6z" /></>}
  </svg>;
}

export function TrustSection() {
  return <section className="section-space border-y border-line" aria-labelledby="trust-heading"><Container>
    <Eyebrow>Built around your requirements</Eyebrow>
    <h2 id="trust-heading" className="mt-4 text-3xl md:text-4xl">Why Choose MAIWEIDA</h2>
    <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">Four priorities for your tooling enquiry. Shipping arrangements, inspection scope, custom tooling feasibility and technical support must be confirmed for the selected product.</p>
    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{priorities.map(item => <div key={item.icon} className="border-t border-line pt-6">
      <PriorityIcon type={item.icon} /><span className="mt-5 block h-0.5 w-6 bg-orange" aria-hidden="true" />
      <h3 className="mt-5 font-sans text-base font-semibold tracking-normal">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
    </div>)}</div>
  </Container></section>;
}
