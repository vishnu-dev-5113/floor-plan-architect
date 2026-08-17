import { memo, useMemo } from "react";
import { Layer, Line } from "react-konva";
import type { Viewport } from "@/geometry/coordinates";
import { visibleWorldBounds } from "@/geometry/coordinates";
import { CANVAS } from "./palette";

interface Props {
  viewport: Viewport;
  size: { width: number; height: number };
  spacing: number;
  majorEvery: number;
  visible: boolean;
}

function GridLayerBase({ viewport, size, spacing, majorEvery, visible }: Props) {
  const lines = useMemo(() => {
    if (!visible) return [];
    const b = visibleWorldBounds(viewport, size);
    // keep the on-screen density sane at any zoom level
    let step = spacing;
    while (step * viewport.zoom < 6) step *= majorEvery;
    const major = step * majorEvery;
    const out: { points: number[]; major: boolean }[] = [];
    const startX = Math.floor(b.minX / step) * step;
    const startY = Math.floor(b.minY / step) * step;
    for (let x = startX; x <= b.maxX; x += step) {
      out.push({ points: [x, b.minY, x, b.maxY], major: Math.abs(x % major) < 1e-6 });
    }
    for (let y = startY; y <= b.maxY; y += step) {
      out.push({ points: [b.minX, y, b.maxX, y], major: Math.abs(y % major) < 1e-6 });
    }
    return out;
  }, [viewport, size, spacing, majorEvery, visible]);

  return (
    <Layer
      listening={false}
      x={viewport.x}
      y={viewport.y}
      scaleX={viewport.zoom}
      scaleY={viewport.zoom}
    >
      {lines.map((l, i) => (
        <Line
          key={i}
          points={l.points}
          stroke={l.major ? CANVAS.gridMajor : CANVAS.gridMinor}
          strokeWidth={(l.major ? 1.4 : 0.7) / viewport.zoom}
          listening={false}
          perfectDrawEnabled={false}
          shadowForStrokeEnabled={false}
        />
      ))}
    </Layer>
  );
}

export const GridLayer = memo(GridLayerBase);