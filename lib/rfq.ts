import { englishValue } from "./catalog-core";

export const rfqFields = [
  { name: "name", label: "Name", required: true, maxLength: 100, autoComplete: "name" },
  { name: "company", label: "Company", required: true, maxLength: 160, autoComplete: "organization" },
  { name: "email", label: "Email", required: true, maxLength: 254, autoComplete: "email" },
  { name: "country", label: "Country", required: true, maxLength: 100, autoComplete: "country-name" },
  { name: "model", label: "Product Model", required: false, maxLength: 200, autoComplete: "off" },
  { name: "quantity", label: "Quantity", required: false, maxLength: 10, autoComplete: "off" },
  { name: "message", label: "Message", required: true, maxLength: 5000, autoComplete: "off" },
] as const;

export type RfqField = (typeof rfqFields)[number]["name"];
export type RfqErrors = Partial<Record<RfqField, string>>;

export function validateRfq(values: Record<RfqField, string>): RfqErrors {
  const errors: RfqErrors = {};
  for (const field of rfqFields) {
    const value = values[field.name].trim();
    if (field.required && !value) errors[field.name] = `Please enter your ${field.label.toLowerCase()}.`;
    else if (value.length > field.maxLength) errors[field.name] = `Use ${field.maxLength} characters or fewer.`;
  }
  if (values.email.trim() && !errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (values.quantity.trim() && !errors.quantity && !/^[1-9]\d*$/.test(values.quantity.trim())) {
    errors.quantity = "Please enter a whole number greater than zero.";
  }
  return errors;
}

export function rfqModel(value: unknown): string {
  return englishValue(value)?.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200) ?? "";
}
