import type { FloorPlan, Point } from "@/domain/types";
import { angleDeg } from "@/geometry/angle";
import { pointToSegmentDistance } from "@/geometry/distance";

/** Aligns an opening (door/window) with the nearest wall under the cursor. */
export function rotationFromNearestWall(plan: FloorPlan, p: Point, maxDistance = 800): number {
  let best = 0;
  let bestDist = maxDistance;
  for (const w of plan.walls) {
    const d = pointToSegmentDistance(p, w.start, w.end);
    if (d < bestDist) {
      bestDist = d;
      best = angleDeg(w.start, w.end);
    }
  }
  return Math.round(best);
}