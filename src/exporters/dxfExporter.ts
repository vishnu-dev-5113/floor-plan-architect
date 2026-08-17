import type { FloorPlan } from "@/domain/types";
import { distance } from "@/geometry/distance";
import { ExportError } from "./types";

/**
 * DXF exporter.
 *
 * Dependency note: no third-party library is used. The AutoCAD R12 ASCII DXF
 * format is written directly from the FloorPlan domain model, which keeps the
 * exporter free of licensing constraints and completely decoupled from Konva.
 *
 * Mapping:
 *   Wall      -> LINE (wall centreline) on layer WALLS
 *   Window    -> LINE(s) on layer WINDOWS
 *   Door      -> LINE (leaf) + ARC (swing) on layer DOORS
 *   Dimension -> LINE(s) + TEXT on layer DIMENSIONS
 *   Room      -> LWPOLYLINE-equivalent LINE loop + TEXT label on layer ROOMS
 *   Text      -> TEXT on layer ANNOTATIONS
 *
 * DXF Y axis points up, screen/domain Y points down, so Y is negated.
 */

const g = (code: number, value: string | number) => `${code}\n${value}\n`;
const fy = (y: number) => -y;

function line(layer: string, x1: number, y1: number, x2: number, y2: number) {
  return (
    g(0, "LINE") +
    g(8, layer) +
    g(10, x1) +
    g(20, fy(y1)) +
    g(30, 0) +
    g(11, x2) +
    g(21, fy(y2)) +
    g(31, 0)
  );
}

function arc(layer: string, cx: number, cy: number, r: number, a1: number, a2: number) {
  return (
    g(0, "ARC") +
    g(8, layer) +
    g(10, cx) +
    g(20, fy(cy)) +
    g(30, 0) +
    g(40, r) +
    g(50, a1) +
    g(51, a2)
  );
}

function text(layer: string, x: number, y: number, height: number, value: string, rot = 0) {
  return (
    g(0, "TEXT") +
    g(8, layer) +
    g(10, x) +
    g(20, fy(y)) +
    g(30, 0) +
    g(40, height) +
    g(1, value) +
    g(50, -rot)
  );
}

const LAYERS = ["WALLS", "DOORS", "WINDOWS", "ROOMS", "DIMENSIONS", "ANNOTATIONS"];

export function buildDXF(plan: FloorPlan): string {
  if (plan.units !== "mm") {
    throw new ExportError(`DXF export currently supports millimetre plans only.`);
  }
  const visible = (layerId: string) =>
    plan.layers.find((l) => l.id === layerId)?.visible !== false;

  let out = "";
  // TABLES section with layer definitions
  out += g(0, "SECTION") + g(2, "TABLES") + g(0, "TABLE") + g(2, "LAYER") + g(70, LAYERS.length);
  LAYERS.forEach((name, i) => {
    out += g(0, "LAYER") + g(2, name) + g(70, 0) + g(62, i + 1) + g(6, "CONTINUOUS");
  });
  out += g(0, "ENDTAB") + g(0, "ENDSEC");

  out += g(0, "SECTION") + g(2, "ENTITIES");

  for (const w of plan.walls) {
    if (!visible(w.layerId)) continue;
    out += line("WALLS", w.start.x, w.start.y, w.end.x, w.end.y);
  }

  for (const r of plan.rooms) {
    if (!visible(r.layerId)) continue;
    const { x, y } = r.position;
    out += line("ROOMS", x, y, x + r.width, y);
    out += line("ROOMS", x + r.width, y, x + r.width, y + r.height);
    out += line("ROOMS", x + r.width, y + r.height, x, y + r.height);
    out += line("ROOMS", x, y + r.height, x, y);
    out += text("ROOMS", x + r.width / 2, y + r.height / 2, 300, r.name);
  }

  for (const d of plan.doors) {
    if (!visible(d.layerId)) continue;
    const rad = (d.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const local = (lx: number, ly: number) => ({
      x: d.position.x + lx * cos - ly * sin,
      y: d.position.y + lx * sin + ly * cos,
    });
    const hinge = local(-d.width / 2, 0);
    const dir = d.swing === "left" ? 1 : -1;
    const leafEnd = local(-d.width / 2, dir * d.width);
    out += line("DOORS", hinge.x, hinge.y, leafEnd.x, leafEnd.y);
    const base = d.rotation;
    const a1 = dir > 0 ? -base - 90 : -base;
    out += arc("DOORS", hinge.x, hinge.y, d.width, a1, a1 + 90);
  }

  for (const w of plan.windows) {
    if (!visible(w.layerId)) continue;
    const rad = (w.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const local = (lx: number, ly: number) => ({
      x: w.position.x + lx * cos - ly * sin,
      y: w.position.y + lx * sin + ly * cos,
    });
    const offsets = [-110, 0, 110];
    for (const o of offsets) {
      const a = local(-w.width / 2, o);
      const b = local(w.width / 2, o);
      out += line("WINDOWS", a.x, a.y, b.x, b.y);
    }
  }

  for (const d of plan.dimensions) {
    if (!visible(d.layerId)) continue;
    const dx = d.end.x - d.start.x;
    const dy = d.end.y - d.start.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * d.offset;
    const ny = (dx / len) * d.offset;
    const a = { x: d.start.x + nx, y: d.start.y + ny };
    const b = { x: d.end.x + nx, y: d.end.y + ny };
    out += line("DIMENSIONS", a.x, a.y, b.x, b.y);
    out += line("DIMENSIONS", d.start.x, d.start.y, a.x, a.y);
    out += line("DIMENSIONS", d.end.x, d.end.y, b.x, b.y);
    out += text(
      "DIMENSIONS",
      (a.x + b.x) / 2,
      (a.y + b.y) / 2,
      250,
      `${Math.round(distance(d.start, d.end))} mm`,
    );
  }

  for (const t of plan.texts) {
    if (!visible(t.layerId)) continue;
    out += text("ANNOTATIONS", t.position.x, t.position.y, t.fontSize, t.text, t.rotation);
  }

  out += g(0, "ENDSEC") + g(0, "EOF");
  return out;
}

export async function exportDXF(plan: FloorPlan): Promise<Blob> {
  try {
    return new Blob([buildDXF(plan)], { type: "application/dxf" });
  } catch (err) {
    throw err instanceof ExportError
      ? err
      : new ExportError(`DXF export failed: ${(err as Error).message}`);
  }
}