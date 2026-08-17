import type { Point } from "@/domain/types";
import { distance } from "@/geometry/distance";

export const dimensionLength = (a: Point, b: Point) => distance(a, b);

export function dimensionOffsetLine(a: Point, b: Point, offset: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * offset;
  const ny = (dx / len) * offset;
  return {
    a: { x: a.x + nx, y: a.y + ny },
    b: { x: b.x + nx, y: b.y + ny },
  };
}