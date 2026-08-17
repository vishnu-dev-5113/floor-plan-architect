import { memo } from "react";
import { Text } from "react-konva";
import type { TextObject } from "@/domain/types";
import { CANVAS } from "./palette";

function TextLayerBase({ texts }: { texts: TextObject[] }) {
  return (
    <>
      {texts.map((t) => (
        <Text
          key={t.id}
          x={t.position.x}
          y={t.position.y - t.fontSize}
          text={t.text}
          fontSize={t.fontSize}
          rotation={t.rotation}
          align={t.align}
          fill={CANVAS.text}
          listening={false}
        />
      ))}
    </>
  );
}

export const TextLayer = memo(TextLayerBase);