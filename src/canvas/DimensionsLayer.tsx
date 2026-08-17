import { memo } from "react";
import { Group, Line, Text } from "react-konva";
import type { Dimension } from "@/domain/types";
import { distance } from "@/geometry/distance";
import { dimensionOffsetLine } from "@/tools/dimensionTool";
import { angleDeg, normalizeDeg } from "@/geometry/angle";
import { CANVAS } from "./palette";

function DimensionsLayerBase({ dimensions }: { dimensions: Dimension[] }) {
  return (
    <>
      {dimensions.map((d) => {
        const { a, b } = dimensionOffsetLine(d.start, d.end, d.offset);
        const len = Math.round(distance(d.start, d.end));
        let rot = normalizeDeg(angleDeg(a, b));
        if (rot > 90 && rot < 270) rot -= 180;
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        return (
          <Group key={d.id} listening={false}>
            <Line
              points={[a.x, a.y, b.x, b.y]}
              stroke={CANVAS.dimension}
              strokeWidth={25}
              perfectDrawEnabled={false}
            />
            <Line
              points={[d.start.x, d.start.y, a.x, a.y]}
              stroke={CANVAS.dimension}
              strokeWidth={15}
              dash={[100, 80]}
              perfectDrawEnabled={false}
            />
            <Line
              points={[d.end.x, d.end.y, b.x, b.y]}
              stroke={CANVAS.dimension}
              strokeWidth={15}
              dash={[100, 80]}
              perfectDrawEnabled={false}
            />
            <Group x={mid.x} y={mid.y} rotation={rot}>
              <Text
                x={-1000}
                y={-330}
                width={2000}
                align="center"
                text={`${len} mm`}
                fontSize={260}
                fill={CANVAS.dimension}
                listening={false}
              />
            </Group>
          </Group>
        );
      })}
    </>
  );
}

export const DimensionsLayer = memo(DimensionsLayerBase);