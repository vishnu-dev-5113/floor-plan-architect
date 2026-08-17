import type { FloorPlan } from "@/domain/types";
import { ImportNotSupportedError } from "./svgImporter";

/** DXF import placeholder — produces FloorPlan JSON once implemented. */
export async function importDXF(_file: File): Promise<FloorPlan> {
  throw new ImportNotSupportedError(
    "DXF import is not available in V1. Use JSON import instead.",
  );
}