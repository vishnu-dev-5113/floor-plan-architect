import type { FloorPlan } from "@/domain/types";
import { distance, planBounds, roomArea } from "@/geometry/distance";
import { ExportError } from "./types";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Builds a true vector SVG straight from the domain model (never a canvas screenshot). */
export function buildSVG(plan: FloorPlan): string {
  try {
    const b = planBounds(plan);
    const pad = 1500;
    const minX = b.minX - pad;
    const minY = b.minY - pad;
    const width = b.maxX - b.minX + pad * 2;
    const height = b.maxY - b.minY + pad * 2;
    const visible = (layerId: string) =>
      plan.layers.find((l) => l.id === layerId)?.visible !== false;
    const parts: string[] = [];

    for (const r of plan.rooms) {
      if (!visible(r.layerId)) continue;
      parts.push(
        `<rect x="${r.position.x}" y="${r.position.y}" width="${r.width}" height="${r.height}" fill="#eef2f6" stroke="#c2ccd6" stroke-width="20"/>`,
      );
      parts.push(
        `<text x="${r.position.x + r.width / 2}" y="${r.position.y + r.height / 2}" font-size="300" text-anchor="middle" fill="#334155">${esc(r.name)}</text>`,
      );
      parts.push(
        `<text x="${r.position.x + r.width / 2}" y="${r.position.y + r.height / 2 + 360}" font-size="240" text-anchor="middle" fill="#64748b">${roomArea(r.width, r.height).toFixed(2)} m²</text>`,
      );
    }

    for (const w of plan.walls) {
      if (!visible(w.layerId)) continue;
      parts.push(
        `<line x1="${w.start.x}" y1="${w.start.y}" x2="${w.end.x}" y2="${w.end.y}" stroke="#111827" stroke-width="${w.thickness}" stroke-linecap="butt"/>`,
      );
    }

    for (const d of plan.doors) {
      if (!visible(d.layerId)) continue;
      const dir = d.swing === "left" ? 1 : -1;
      parts.push(
        `<g transform="translate(${d.position.x} ${d.position.y}) rotate(${d.rotation})">` +
          `<rect x="${-d.width / 2}" y="-110" width="${d.width}" height="220" fill="#ffffff" stroke="none"/>` +
          `<line x1="${-d.width / 2}" y1="0" x2="${-d.width / 2}" y2="${dir * d.width}" stroke="#1d4ed8" stroke-width="40"/>` +
          `<path d="M ${-d.width / 2} ${dir * d.width} A ${d.width} ${d.width} 0 0 ${dir > 0 ? 0 : 1} ${d.width / 2} 0" fill="none" stroke="#1d4ed8" stroke-width="25" stroke-dasharray="120 80"/>` +
          `</g>`,
      );
    }

    for (const w of plan.windows) {
      if (!visible(w.layerId)) continue;
      parts.push(
        `<g transform="translate(${w.position.x} ${w.position.y}) rotate(${w.rotation})">` +
          `<rect x="${-w.width / 2}" y="-110" width="${w.width}" height="220" fill="#ffffff" stroke="#0f766e" stroke-width="30"/>` +
          `<line x1="${-w.width / 2}" y1="0" x2="${w.width / 2}" y2="0" stroke="#0f766e" stroke-width="30"/>` +
          `</g>`,
      );
    }

    for (const d of plan.dimensions) {
      if (!visible(d.layerId)) continue;
      const dx = d.end.x - d.start.x;
      const dy = d.end.y - d.start.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * d.offset;
      const ny = (dx / len) * d.offset;
      const a = { x: d.start.x + nx, y: d.start.y + ny };
      const c = { x: d.end.x + nx, y: d.end.y + ny };
      parts.push(
        `<g stroke="#b45309" stroke-width="25" fill="none">` +
          `<line x1="${a.x}" y1="${a.y}" x2="${c.x}" y2="${c.y}"/>` +
          `<line x1="${d.start.x}" y1="${d.start.y}" x2="${a.x}" y2="${a.y}"/>` +
          `<line x1="${d.end.x}" y1="${d.end.y}" x2="${c.x}" y2="${c.y}"/>` +
          `</g>` +
          `<text x="${(a.x + c.x) / 2}" y="${(a.y + c.y) / 2 - 80}" font-size="280" text-anchor="middle" fill="#b45309">${Math.round(distance(d.start, d.end))} mm</text>`,
      );
    }

    for (const t of plan.texts) {
      if (!visible(t.layerId)) continue;
      parts.push(
        `<text x="${t.position.x}" y="${t.position.y}" font-size="${t.fontSize}" text-anchor="${t.align === "center" ? "middle" : t.align === "right" ? "end" : "start"}" transform="rotate(${t.rotation} ${t.position.x} ${t.position.y})" fill="#0f172a">${esc(t.text)}</text>`,
      );
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${Math.round(width / 10)}" height="${Math.round(height / 10)}">\n<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#ffffff"/>\n${parts.join("\n")}\n</svg>`;
  } catch (err) {
    throw new ExportError(`SVG export failed: ${(err as Error).message}`);
  }
}

export function exportSVG(plan: FloorPlan): Blob {
  return new Blob([buildSVG(plan)], { type: "image/svg+xml" });
}