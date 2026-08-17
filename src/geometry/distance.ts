import type { FloorPlan, Point } from "@/domain/types";
import type { Bounds } from "./coordinates";

export const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

export const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export function pointToSegmentDistance(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return distance(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}

export function planBounds(plan: FloorPlan): Bounds {
  const pts: Point[] = [];
  plan.walls.forEach((w) => pts.push(w.start, w.end));
  plan.dimensions.forEach((d) => pts.push(d.start, d.end));
  plan.doors.forEach((d) => pts.push(d.position));
  plan.windows.forEach((w) => pts.push(w.position));
  plan.texts.forEach((t) => pts.push(t.position));
  plan.rooms.forEach((r) =>
    pts.push(r.position, { x: r.position.x + r.width, y: r.position.y + r.height }),
  );
  if (pts.length === 0) return { minX: 0, minY: 0, maxX: 10000, maxY: 8000 };
  return {
    minX: Math.min(...pts.map((p) => p.x)),
    minY: Math.min(...pts.map((p) => p.y)),
    maxX: Math.max(...pts.map((p) => p.x)),
    maxY: Math.max(...pts.map((p) => p.y)),
  };
}

export const roomArea = (width: number, height: number) => (width * height) / 1_000_000;