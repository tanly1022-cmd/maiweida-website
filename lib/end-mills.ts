export type EndMillVariant = {
  id: string; model: string; diameter: number; radius: number | null; fluteLength: number;
  overallLength: number; shankDiameter: number; flutes: number; reviewRequired: boolean; reviewNote?: string;
};
export type EndMill = { group: string; geometry: string; length: string; variants: EndMillVariant[] };
// Public allowlist: extraction provenance and unverified application matrices stay server-side.
export function normalizeEndMill(value: unknown): EndMill | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const row = value as Record<string, unknown>;
  const text = (v: unknown): v is string => typeof v === "string" && /^[\x20-\x7e]+$/.test(v) && !!v.trim();
  const positive = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v > 0;
  if (!text(row.group) || !text(row.geometry) || !text(row.length) || !Array.isArray(row.variants)) return undefined;
  const ids = new Set<string>();
  const variants = row.variants.flatMap((value): EndMillVariant[] => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const v = value as Record<string, unknown>;
    if (!text(v.id) || !text(v.model) || ids.has(v.id) || !positive(v.diameter) || !positive(v.fluteLength) ||
      !positive(v.overallLength) || !positive(v.shankDiameter) || !positive(v.flutes) || !Number.isInteger(v.flutes) ||
      !(v.radius === null || positive(v.radius)) || v.fluteLength > v.overallLength) return [];
    ids.add(v.id);
    return [{ id: v.id, model: v.model, diameter: v.diameter, radius: v.radius, fluteLength: v.fluteLength,
      overallLength: v.overallLength, shankDiameter: v.shankDiameter, flutes: v.flutes,
      reviewRequired: v.reviewRequired === true, ...(text(v.reviewNote) ? { reviewNote: v.reviewNote } : {}) }];
  });
  return variants.length ? { group: row.group, geometry: row.geometry, length: row.length, variants } : undefined;
}
export function endMillDimensions(v: EndMillVariant): string {
  return `D ${v.diameter}${v.radius === null ? "" : ` / R ${v.radius}`} / H ${v.fluteLength} / L ${v.overallLength} / d ${v.shankDiameter} mm / ${v.flutes} flutes`;
}
export function endMillEnquiry(v: EndMillVariant): string {
  return `${v.model} | ${endMillDimensions(v)}${v.reviewRequired ? " | SOURCE CODE TO CONFIRM" : ""}`;
}
