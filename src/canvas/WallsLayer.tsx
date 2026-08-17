import { memo } from "react";
import { Line } from "react-konva";
import type { Wall } from "@/domain/types";
import { CANVAS } from "./palette";

function WallsLayerBase({ walls }: { walls: Wall[] }) {
  return (
    <>
      {walls.map((w) => (
        <Line
          key={w.id}
          points={[w.start.x, w.start.y, w.end.x, w.end.y]}
          stroke={CANVAS.wall}
          strokeWidth={w.thickness}
          lineCap="butt"
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}
    </>
  );
}

export const WallsLayer = memo(WallsLayerBase);