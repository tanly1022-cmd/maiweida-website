// Public business number. Use international digits only, with no + or spaces.
export const DEFAULT_WHATSAPP_NUMBER = "8618673309556";

export function whatsappContact(value: string | undefined) {
  const number = value?.trim() || DEFAULT_WHATSAPP_NUMBER;
  const configured = /^[1-9]\d{6,14}$/.test(number);
  return { configured, href: `https://wa.me/${configured ? number : DEFAULT_WHATSAPP_NUMBER}` };
}
