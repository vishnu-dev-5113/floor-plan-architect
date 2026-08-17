import type { FloorPlan } from "@/domain/types";
import { exportJSON } from "./jsonExporter";
import { exportSVG } from "./svgExporter";
import { exportPNG } from "./pngExporter";
import { exportDXF } from "./dxfExporter";
import { exportDWG } from "./dwgExporter";
import type { FloorPlanExporter } from "./types";

export const floorPlanExporter: FloorPlanExporter = {
  exportJSON,
  exportSVG,
  exportPNG: (_plan: FloorPlan) => exportPNG(),
  exportDXF,
  exportDWG,
};

export * from "./types";
export { registerStage } from "./pngExporter";
export { DWG_UNAVAILABLE_MESSAGE } from "./dwgExporter";