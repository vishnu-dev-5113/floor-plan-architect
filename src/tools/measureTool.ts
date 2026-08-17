import type { Point } from "@/domain/types";
import { angleDeg, normalizeDeg } from "@/geometry/angle";
import { distance } from "@/geometry/distance";

export function measure(a: Point, b: Point) {
  return {
    distance: distance(a, b),
    angle: normalizeDeg(angleDeg(a, b)),
  };
}