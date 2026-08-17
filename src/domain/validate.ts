import { defaultLayers } from "./factories";
import { FLOOR_PLAN_VERSION, type FloorPlan } from "./types";

export class FloorPlanValidationError extends Error {}

const isPoint = (p: unknown): boolean =>
  !!p &&
  typeof p === "object" &&
  Number.isFinite((p as { x: unknown }).x as number) &&
  Number.isFinite((p as { y: unknown }).y as number);

const arr = (v: unknown) => (Array.isArray(v) ? v : []);

/**
 * Validates and normalises an unknown value into a FloorPlan.
 * Throws FloorPlanValidationError with a user friendly message when invalid.
 */
export function validateFloorPlan(raw: unknown): FloorPlan {
  if (!raw || typeof raw !== "object") {
    throw new FloorPlanValidationError("Invalid floor plan file.");
  }
  const p = raw as Partial<FloorPlan> & Record<string, unknown>;

  if (typeof p.version !== "number") {
    throw new FloorPlanValidationError("Invalid floor plan file: missing version.");
  }
  if (p.version > FLOOR_PLAN_VERSION) {
    throw new FloorPlanValidationError(
      `Unsupported floor plan version ${p.version}. This editor supports version ${FLOOR_PLAN_VERSION}.`,
    );
  }
  if (p.units && !["mm", "cm", "m"].includes(p.units)) {
    throw new FloorPlanValidationError(`Unsupported units "${String(p.units)}".`);
  }

  const walls = arr(p.walls).filter(
    (w) =>
      w &&
      isPoint(w.start) &&
      isPoint(w.end) &&
      Number.isFinite(w.thickness) &&
      w.thickness > 0,
  );
  if (arr(p.walls).length !== walls.length) {
    throw new FloorPlanValidationError("Floor plan contains invalid wall geometry.");
  }

  const now = new Date().toISOString();
  const layers = arr(p.layers).length ? (p.layers as FloorPlan["layers"]) : defaultLayers();
  const fallbackLayer = layers[0]?.id ?? "layer-walls";
  const withLayer = <T extends { layerId?: string; id?: string }>(items: unknown[], prefix: string) =>
    items.map((item, i) => {
      const o = item as T;
      return {
        ...o,
        id: o.id ?? `${prefix}-${i}`,
        layerId: layers.some((l) => l.id === o.layerId) ? o.layerId : fallbackLayer,
      };
    });

  return {
    id: typeof p.id === "string" ? p.id : `plan-${Date.now()}`,
    name: typeof p.name === "string" ? p.name : "Imported Plan",
    version: FLOOR_PLAN_VERSION,
    units: (p.units as FloorPlan["units"]) ?? "mm",
    walls: withLayer(walls, "wall") as FloorPlan["walls"],
    doors: withLayer(arr(p.doors).filter((d) => isPoint(d?.position)), "door") as FloorPlan["doors"],
    windows: withLayer(arr(p.windows).filter((w) => isPoint(w?.position)), "win") as FloorPlan["windows"],
    rooms: withLayer(
      arr(p.rooms).filter((r) => isPoint(r?.position) && Number.isFinite(r?.width)),
      "room",
    ) as FloorPlan["rooms"],
    dimensions: withLayer(
      arr(p.dimensions).filter((d) => isPoint(d?.start) && isPoint(d?.end)),
      "dim",
    ) as FloorPlan["dimensions"],
    texts: withLayer(arr(p.texts).filter((t) => isPoint(t?.position)), "text") as FloorPlan["texts"],
    layers,
    metadata: {
      createdAt: p.metadata?.createdAt ?? now,
      updatedAt: now,
    },
  };
}