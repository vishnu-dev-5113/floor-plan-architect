import {
  MousePointer2, Minus, DoorOpen, Columns3, Square, Ruler, Type, MoveDiagonal,
} from "lucide-react";
import type { ToolId } from "@/state/floorPlanStore";
import { useEditorStore } from "@/state/floorPlanStore";
import { cn } from "@/lib/utils";

const TOOLS: { id: ToolId; label: string; icon: typeof Minus; key: string }[] = [
  { id: "select", label: "Select", icon: MousePointer2, key: "V" },
  { id: "wall", label: "Wall", icon: Minus, key: "W" },
  { id: "door", label: "Door", icon: DoorOpen, key: "D" },
  { id: "window", label: "Window", icon: Columns3, key: "N" },
  { id: "room", label: "Room", icon: Square, key: "R" },
  { id: "dimension", label: "Dimension", icon: Ruler, key: "M" },
  { id: "measure", label: "Measure", icon: MoveDiagonal, key: "Q" },
  { id: "text", label: "Text", icon: Type, key: "T" },
];

export function Toolbar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const mode = useEditorStore((s) => s.mode);

  return (
    <div className="flex w-14 flex-col items-center gap-1 border-r border-border bg-panel py-2">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        const disabled = mode === "view" && t.id !== "select" && t.id !== "measure";
        return (
          <button
            key={t.id}
            type="button"
            title={`${t.label} (${t.key})`}
            aria-label={t.label}
            disabled={disabled}
            onClick={() => setActiveTool(t.id)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              activeTool === t.id &&
                "border-primary/60 bg-primary/15 text-primary shadow-[0_0_0_1px_var(--color-primary)]",
              disabled && "pointer-events-none opacity-30",
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
