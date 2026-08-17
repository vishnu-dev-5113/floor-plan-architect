import type { FloorPlan } from "@/domain/types";

export function serializeFloorPlan(plan: FloorPlan): string {
  return JSON.stringify(plan, null, 2);
}

export function exportJSON(plan: FloorPlan): Blob {
  return new Blob([serializeFloorPlan(plan)], { type: "application/json" });
}