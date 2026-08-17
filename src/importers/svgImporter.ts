import type { FloorPlan } from "@/domain/types";

export class ImportNotSupportedError extends Error {}

/**
 * SVG import is not part of V1. The pipeline is intentionally shaped as
 * file -> importer -> FloorPlan JSON -> renderer, so an implementation can be
 * dropped in here without touching the editor or Konva.
 */
export async function importSVG(_file: File): Promise<FloorPlan> {
  throw new ImportNotSupportedError(
    "SVG import is not available in V1. Use JSON import instead.",
  );
}