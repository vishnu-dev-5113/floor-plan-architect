import type { Point } from "@/domain/types";

export const angleRad = (a: Point, b: Point) => Math.atan2(b.y - a.y, b.x - a.x);

export const angleDeg = (a: Point, b: Point) => (angleRad(a, b) * 180) / Math.PI;

export const normalizeDeg = (deg: number) => ((deg % 360) + 360) % 360;

/** Constrain b to a 0/90/180/270 direction relative to a. */
export function orthoConstrain(a: Point, b: Point): Point {
  return Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)
    ? { x: b.x, y: a.y }
    : { x: a.x, y: b.y };
}