import type { FloorPlan } from "@/domain/types";
import { ExportError } from "./types";

/**
 * DWG export adapter.
 *
 * DWG is a proprietary binary format; there is no reliable open-source
 * browser-side writer. This adapter therefore posts the FloorPlan JSON to a
 * CAD conversion service. Until such a service is configured the export fails
 * loudly — we never rename a DXF/SVG file to .dwg or emit an invalid DWG.
 *
 * Future backend contract:
 *   POST /api/cad/export/dwg   { "floorPlan": { ... } }  ->  application/acad
 */

export interface CadConversionService {
  endpoint: string | null;
}

export const cadConversionService: CadConversionService = {
  endpoint: null,
};

export const DWG_UNAVAILABLE_MESSAGE = "DWG export requires the CAD conversion service.";

export async function exportDWG(plan: FloorPlan): Promise<Blob> {
  if (!cadConversionService.endpoint) {
    throw new ExportError(DWG_UNAVAILABLE_MESSAGE);
  }
  const res = await fetch(cadConversionService.endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ floorPlan: plan }),
  });
  if (!res.ok) {
    throw new ExportError(`CAD conversion service failed (${res.status}).`);
  }
  return await res.blob();
}