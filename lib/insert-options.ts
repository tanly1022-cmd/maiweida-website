import type { Product, GradeRecommendation } from "./catalog-core";
export const recommendationLabels: Record<GradeRecommendation["recommendation"], string> = {
  main: "Main recommended", general: "General", available: "Available to produce",
};
export const recommendationSymbols: Record<GradeRecommendation["recommendation"], string> = {
  main: "\u25cf", general: "\u25d0", available: "\u25cb",
};
export function gradeLabel(product: Product, grade: string) {
  const item = product.gradeRecommendations?.find(item => item.grade === grade);
  return item ? `${grade} - ${recommendationLabels[item.recommendation]}` : grade;
}
export function insertEnquiryModel(product: Product, grade: string) {
  return product.grades?.includes(grade) ? `${product.model} / Grade: ${grade}` : product.model;
}
