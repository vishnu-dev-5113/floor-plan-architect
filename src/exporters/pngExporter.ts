import type Konva from "konva";
import { ExportError } from "./types";

let stageRef: Konva.Stage | null = null;

/** The canvas registers its stage here; PNG is the one export that uses Konva. */
export function registerStage(stage: Konva.Stage | null) {
  stageRef = stage;
}

export function exportPNG(pixelRatio = 2): Blob {
  if (!stageRef) throw new ExportError("Drawing area is not ready for PNG export.");
  const dataUrl = stageRef.toDataURL({ pixelRatio, mimeType: "image/png" });
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new ExportError("PNG export failed.");
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: "image/png" });
}