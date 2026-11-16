import { site } from "@/lib/site";
import { DEFAULT_WHATSAPP_NUMBER, whatsappContact } from "@/lib/whatsapp";
import { Icon } from "./icon";

export function ContactLinks({ inline = false }: { inline?: boolean }) {
  const { href } = whatsappContact(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const number = href.slice(href.lastIndexOf("/") + 1);
  const displayNumber = number === DEFAULT_WHATSAPP_NUMBER ? "+86 186 7330 9556" : `+${number}`;
  return <address className={`flex min-w-0 gap-x-5 gap-y-2 text-xs leading-6 not-italic ${inline ? "flex-wrap" : "flex-col items-start"}`}>
    <a href={`mailto:${site.email}`} className="icon-label inline-flex min-h-9 min-w-0 items-center gap-2 text-steel underline decoration-silver underline-offset-4 hover:decoration-orange"><Icon name="mail" /><span className="break-anywhere"><span className="sr-only">Email: </span>{site.email}</span></a>
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${displayNumber} (opens in a new tab)`} className="icon-label inline-flex min-h-9 items-center gap-2 text-steel underline decoration-silver underline-offset-4 hover:decoration-orange"><Icon name="whatsapp" /><span className="whitespace-nowrap">{displayNumber}</span></a>
  </address>;
}
