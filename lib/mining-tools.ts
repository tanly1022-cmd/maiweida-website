export type MiningColumn = { label: string; unit: "mm" | "°" };
export type MiningVariant = { id: string; model: string; values: string[]; reviewRequired: boolean; reviewNote?: string };
export type MiningTool = { appearanceId?: string; appearanceName?: string; columns: MiningColumn[]; variants: MiningVariant[]; referenceGrades: string[]; sourceNote?: string };
const text = (v: unknown): v is string => typeof v === "string" && !!v.trim() && /^[\x20-\x7e°αβθ]+$/.test(v);
const record = (v: unknown): Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
// Public allowlist. PDF paths, OCR and extraction provenance must never cross the client boundary.
export function normalizeMiningTool(value: unknown): MiningTool | undefined {
  const row = record(value);
  if (!Array.isArray(row.columns) || !row.columns.length || !Array.isArray(row.variants)) return undefined;
  const labels = new Set<string>();
  const columns: MiningColumn[] = [];
  for (const item of row.columns) {
    const c = record(item);
    if (!text(c.label) || labels.has(c.label) || !["mm", "°"].includes(String(c.unit))) return undefined;
    labels.add(c.label); columns.push({ label: c.label, unit: c.unit as MiningColumn["unit"] });
  }
  const ids = new Set<string>(), models = new Set<string>();
  const variants = row.variants.flatMap((item): MiningVariant[] => {
    const v = record(item);
    if (!text(v.id) || !/^[a-z0-9-]+$/.test(v.id) || !text(v.model) || ids.has(v.id) || models.has(v.model) ||
      !Array.isArray(v.values) || v.values.length !== columns.length || !v.values.every(n => typeof n === "string" && /^\d+(\.\d+)?$/.test(n) && Number.isFinite(Number(n))) ||
      (v.reviewRequired === true && !text(v.reviewNote))) return [];
    ids.add(v.id); models.add(v.model);
    return [{ id: v.id, model: v.model, values: [...v.values], reviewRequired: v.reviewRequired === true, ...(text(v.reviewNote) ? { reviewNote: v.reviewNote } : {}) }];
  });
  const referenceGrades = Array.isArray(row.referenceGrades) ? [...new Set(row.referenceGrades.filter((g): g is string => text(g) && /^[A-Z0-9-]+$/.test(g)))] : [];
  const appearance = text(row.appearanceId) && /^[a-z0-9-]+$/.test(row.appearanceId) && text(row.appearanceName)
    ? { appearanceId: row.appearanceId, appearanceName: row.appearanceName } : {};
  return variants.length ? { ...appearance, columns, variants, referenceGrades, ...(text(row.sourceNote) ? { sourceNote: row.sourceNote } : {}) } : undefined;
}
export function miningDimensions(series: MiningTool, v: MiningVariant): string {
  return series.columns.map((c, i) => `${c.label} ${v.values[i]}${c.unit === "°" ? "°" : " mm"}`).join(" / ");
}
export function miningEnquiry(series: MiningTool, v: MiningVariant): string {
  return `${v.model} | ${miningDimensions(series, v)}${v.reviewRequired || series.sourceNote ? " | TO CONFIRM" : ""}`;
}
