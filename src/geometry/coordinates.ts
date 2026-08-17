import type { Point } from "@/domain/types";

export interface Viewport {
  x: number;
  y: number;
  /** pixels per millimetre */
  zoom: number;
}

/** zoom value that is displayed as 100% */
export const BASE_ZOOM = 0.1;
export const MIN_ZOOM = 0.002;
export const MAX_ZOOM = 2;

export const zoomPercent = (zoom: number) => Math.round((zoom / BASE_ZOOM) * 100);

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function worldToScreen(p: Point, vp: Viewport): Point {
  return { x: p.x * vp.zoom + vp.x, y: p.y * vp.zoom + vp.y };
}

export function screenToWorld(p: Point, vp: Viewport): Point {
  return { x: (p.x - vp.x) / vp.zoom, y: (p.y - vp.y) / vp.zoom };
}

/** Zoom keeping the given screen point anchored. */
export function zoomAt(vp: Viewport, screen: Point, nextZoom: number): Viewport {
  const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
  const k = z / vp.zoom;
  return {
    zoom: z,
    x: screen.x - (screen.x - vp.x) * k,
    y: screen.y - (screen.y - vp.y) * k,
  };
}

export function wheelZoom(vp: Viewport, screen: Point, deltaY: number, deltaMode = 0) {
  const dy = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 100 : 1);
  return zoomAt(vp, screen, vp.zoom * Math.exp(-dy * 0.0015));
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function fitViewport(
  bounds: Bounds,
  size: { width: number; height: number },
  padding = 60,
): Viewport {
  const w = Math.max(bounds.maxX - bounds.minX, 1);
  const h = Math.max(bounds.maxY - bounds.minY, 1);
  const zoom = clamp(
    Math.min((size.width - padding * 2) / w, (size.height - padding * 2) / h),
    MIN_ZOOM,
    MAX_ZOOM,
  );
  return {
    zoom,
    x: size.width / 2 - ((bounds.minX + bounds.maxX) / 2) * zoom,
    y: size.height / 2 - ((bounds.minY + bounds.maxY) / 2) * zoom,
  };
}

export function visibleWorldBounds(
  vp: Viewport,
  size: { width: number; height: number },
): Bounds {
  const tl = screenToWorld({ x: 0, y: 0 }, vp);
  const br = screenToWorld({ x: size.width, y: size.height }, vp);
  return { minX: tl.x, minY: tl.y, maxX: br.x, maxY: br.y };
}