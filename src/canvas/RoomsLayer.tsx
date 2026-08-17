import { memo } from "react";
import { Group, Rect, Text } from "react-konva";
import type { Room } from "@/domain/types";
import { roomArea } from "@/geometry/distance";
import { CANVAS } from "./palette";

function RoomsLayerBase({ rooms }: { rooms: Room[] }) {
  return (
    <>
      {rooms.map((r) => (
        <Group key={r.id} listening={false}>
          <Rect
            x={r.position.x}
            y={r.position.y}
            width={r.width}
            height={r.height}
            fill={CANVAS.room}
            stroke={CANVAS.roomStroke}
            strokeWidth={20}
            dash={[200, 150]}
            perfectDrawEnabled={false}
          />
          <Text
            x={r.position.x}
            y={r.position.y + r.height / 2 - 340}
            width={r.width}
            align="center"
            text={r.name.toUpperCase()}
            fontSize={300}
            fontStyle="bold"
            fill={CANVAS.roomLabel}
            listening={false}
          />
          <Text
            x={r.position.x}
            y={r.position.y + r.height / 2 + 40}
            width={r.width}
            align="center"
            text={`${(r.width / 1000).toFixed(2)} × ${(r.height / 1000).toFixed(2)} m  ·  ${roomArea(r.width, r.height).toFixed(2)} m²`}
            fontSize={230}
            fill="#64748b"
            listening={false}
          />
        </Group>
      ))}
    </>
  );
}

export const RoomsLayer = memo(RoomsLayerBase);