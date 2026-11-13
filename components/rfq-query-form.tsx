"use client";

import { useSearchParams } from "next/navigation";
import { RfqForm } from "./rfq-form";
import { rfqModel } from "@/lib/rfq";

export function RfqQueryForm() {
  const params = useSearchParams();
  const values = params.getAll("model");
  const model = rfqModel(values.length === 1 ? values[0] : undefined);
  return <RfqForm key={model} initialModel={model} />;
}
