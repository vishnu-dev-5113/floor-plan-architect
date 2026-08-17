import type { Point } from "@/domain/types";

export function rectFromPoints(a: Point, b: Point) {
  return {
    position: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) },
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}