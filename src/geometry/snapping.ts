import type { FloorPlan, Point } from "@/domain/types";
import { distance, midpoint } from "./distance";

export interface SnapSettings {
  enabled: boolean;
  grid: boolean;
  endpoints: boolean;
  midpoints: boolean;
  gridSpacing: number;
  /** snap radius in world units (mm) */
  threshold: number;
}

export interface SnapResult {
  point: Point;
  kind: "none" | "grid" | "endpoint" | "midpoint";
}

export const snapToGrid = (p: Point, spacing: number): Point => ({
  x: Math.round(p.x / spacing) * spacing,
  y: Math.round(p.y / spacing) * spacing,
});

export function collectSnapCandidates(plan: FloorPlan, s: SnapSettings) {
  const pts: { point: Point; kind: "endpoint" | "midpoint" }[] = [];
  for (const w of plan.walls) {
    if (s.endpoints) {
      pts.push({ point: w.start, kind: "endpoint" });
      pts.push({ point: w.end, kind: "endpoint" });
    }
    if (s.midpoints) pts.push({ point: midpoint(w.start, w.end), kind: "midpoint" });
  }
  for (const r of plan.rooms) {
    if (!s.endpoints) break;
    const { x, y } = r.position;
    pts.push(
      { point: { x, y }, kind: "endpoint" },
      { point: { x: x + r.width, y }, kind: "endpoint" },
      { point: { x, y: y + r.height }, kind: "endpoint" },
      { point: { x: x + r.width, y: y + r.height }, kind: "endpoint" },
    );
  }
  return pts;
}

/** Pure snapping: no React, no Konva. */
export function snapPoint(
  point: Point,
  plan: FloorPlan,
  settings: SnapSettings,
): SnapResult {
  if (!settings.enabled) return { point, kind: "none" };

  let best: SnapResult | null = null;
  let bestDist = settings.threshold;
  for (const c of collectSnapCandidates(plan, settings)) {
    const d = distance(point, c.point);
    if (d <= bestDist) {
      bestDist = d;
      best = { point: c.point, kind: c.kind };
    }
  }
  if (best) return best;

  if (settings.grid) {
    return { point: snapToGrid(point, settings.gridSpacing), kind: "grid" };
  }
  return { point, kind: "none" };
}