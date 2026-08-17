import type { FloorPlan, FloorPlanObject, Point } from "@/domain/types";
import { pointToSegmentDistance } from "@/geometry/distance";
import { pointInRect } from "@/geometry/intersections";

/** Pure hit testing against the domain model (Konva is never asked). */
export function hitTest(plan: FloorPlan, p: Point, tolerance: number): string | null {
  const layerVisible = (id: string) => {
    const l = plan.layers.find((x) => x.id === id);
    return l ? l.visible && !l.locked : true;
  };

  for (const t of plan.texts) {
    if (!layerVisible(t.layerId)) continue;
    if (
      pointInRect(p, {
        x: t.position.x,
        y: t.position.y - t.fontSize,
        width: Math.max(t.text.length * t.fontSize * 0.6, t.fontSize),
        height: t.fontSize * 1.4,
      })
    )
      return t.id;
  }
  for (const d of plan.doors) {
    if (!layerVisible(d.layerId)) continue;
    if (Math.hypot(p.x - d.position.x, p.y - d.position.y) <= d.width / 2 + tolerance)
      return d.id;
  }
  for (const w of plan.windows) {
    if (!layerVisible(w.layerId)) continue;
    if (Math.hypot(p.x - w.position.x, p.y - w.position.y) <= w.width / 2 + tolerance)
      return w.id;
  }
  for (const w of plan.walls) {
    if (!layerVisible(w.layerId)) continue;
    if (pointToSegmentDistance(p, w.start, w.end) <= w.thickness / 2 + tolerance)
      return w.id;
  }
  for (const d of plan.dimensions) {
    if (!layerVisible(d.layerId)) continue;
    if (pointToSegmentDistance(p, d.start, d.end) <= tolerance * 2) return d.id;
  }
  for (const r of plan.rooms) {
    if (!layerVisible(r.layerId)) continue;
    if (pointInRect(p, { x: r.position.x, y: r.position.y, width: r.width, height: r.height }))
      return r.id;
  }
  return null;
}

/** Returns a translated copy of an object. Pure, no store access. */
export function translateObject(obj: FloorPlanObject, dx: number, dy: number): FloorPlanObject {
  const move = (p: Point) => ({ x: p.x + dx, y: p.y + dy });
  switch (obj.type) {
    case "wall":
      return { ...obj, start: move(obj.start), end: move(obj.end) };
    case "dimension":
      return { ...obj, start: move(obj.start), end: move(obj.end) };
    default:
      return { ...obj, position: move(obj.position) };
  }
}