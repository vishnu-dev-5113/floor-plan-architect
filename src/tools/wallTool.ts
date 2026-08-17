import type { Point } from "@/domain/types";
import { orthoConstrain } from "@/geometry/angle";

export function resolveWallEnd(start: Point, raw: Point, ortho: boolean): Point {
  return ortho ? orthoConstrain(start, raw) : raw;
}