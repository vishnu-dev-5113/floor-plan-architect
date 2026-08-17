import type { FloorPlan } from "@/domain/types";
import { ImportNotSupportedError } from "./svgImporter";

/** DWG import requires the backend CAD conversion service (DWG -> FloorPlan JSON). */
export async function importDWG(_file: File): Promise<FloorPlan> {
  throw new ImportNotSupportedError(
    "DWG import requires the CAD conversion service.",
  );
}