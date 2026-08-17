import { memo } from "react";
import { Arc, Group, Line, Rect } from "react-konva";
import type { Door } from "@/domain/types";
import { CANVAS } from "./palette";

function DoorsLayerBase({ doors }: { doors: Door[] }) {
  return (
    <>
      {doors.map((d) => {
        const dir = d.swing === "left" ? 1 : -1;
        return (
          <Group
            key={d.id}
            x={d.position.x}
            y={d.position.y}
            rotation={d.rotation}
            listening={false}
          >
            {/* opening cut through the wall */}
            <Rect
              x={-d.width / 2}
              y={-130}
              width={d.width}
              height={260}
              fill={CANVAS.background}
              perfectDrawEnabled={false}
            />
            <Arc
              x={-d.width / 2}
              y={0}
              innerRadius={d.width}
              outerRadius={d.width}
              angle={90}
              rotation={dir > 0 ? 0 : -90}
              stroke={CANVAS.door}
              strokeWidth={25}
              dash={[150, 100]}
              perfectDrawEnabled={false}
            />
            <Line
              points={[-d.width / 2, 0, -d.width / 2, dir * d.width]}
              stroke={CANVAS.door}
              strokeWidth={55}
              perfectDrawEnabled={false}
            />
          </Group>
        );
      })}
    </>
  );
}

export const DoorsLayer = memo(DoorsLayerBase);