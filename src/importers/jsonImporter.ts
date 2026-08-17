import { validateFloorPlan, FloorPlanValidationError } from "@/domain/validate";
import type { FloorPlan } from "@/domain/types";

export async function importJSON(file: File): Promise<FloorPlan> {
  const raw = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new FloorPlanValidationError("Invalid floor plan file: not valid JSON.");
  }
  return validateFloorPlan(parsed);
}