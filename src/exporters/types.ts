import type { FloorPlan } from "@/domain/types";

export interface FloorPlanExporter {
  exportJSON(plan: FloorPlan): Blob;
  exportSVG(plan: FloorPlan): Blob;
  exportPNG(plan: FloorPlan): Blob | Promise<Blob>;
  exportDXF(plan: FloorPlan): Promise<Blob>;
  exportDWG(plan: FloorPlan): Promise<Blob>;
}

export class ExportError extends Error {}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const safeFileName = (name: string) =>
  name.trim().replace(/[^\w.-]+/g, "_").toLowerCase() || "floorplan";