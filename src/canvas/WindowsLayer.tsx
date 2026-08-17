import { memo } from "react";
import { Group, Line, Rect } from "react-konva";
import type { WindowObject } from "@/domain/types";
import { CANVAS } from "./palette";

function WindowsLayerBase({ windows }: { windows: WindowObject[] }) {
  return (
    <>
      {windows.map((w) => (
        <Group
          key={w.id}
          x={w.position.x}
          y={w.position.y}
          rotation={w.rotation}
          listening={false}
        >
          <Rect
            x={-w.width / 2}
            y={-130}
            width={w.width}
            height={260}
            fill={CANVAS.background}
            stroke={CANVAS.window}
            strokeWidth={30}
            perfectDrawEnabled={false}
          />
          <Line
            points={[-w.width / 2, 0, w.width / 2, 0]}
            stroke={CANVAS.window}
            strokeWidth={40}
            perfectDrawEnabled={false}
          />
        </Group>
      ))}
    </>
  );
}

export const WindowsLayer = memo(WindowsLayerBase);