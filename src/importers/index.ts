import type { FloorPlan } from "@/domain/types";
import { importJSON } from "./jsonImporter";
import { importSVG } from "./svgImporter";
import { importDXF } from "./dxfImporter";
import { importDWG } from "./dwgImporter";

export interface FloorPlanImporter {
  importJSON(file: File): Promise<FloorPlan>;
  importSVG(file: File): Promise<FloorPlan>;
  importDXF(file: File): Promise<FloorPlan>;
  importDWG(file: File): Promise<FloorPlan>;
}

export const floorPlanImporter: FloorPlanImporter = {
  importJSON,
  importSVG,
  importDXF,
  importDWG,
};