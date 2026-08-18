import { Eye, EyeOff, Lock, LockOpen } from "lucide-react";
import { useEditorStore } from "@/state/floorPlanStore";
import { cn } from "@/lib/utils";

export function LayersPanel() {
  const layers = useEditorStore((s) => s.floorPlan.layers);
  const toggleLayer = useEditorStore((s) => s.toggleLayer);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const setActiveLayerId = useEditorStore((s) => s.setActiveLayerId);

  return (
    <section className="border-b border-border">
      <h2 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Layers
      </h2>
      <ul className="pb-2">
        {layers.map((l) => (
          <li
            key={l.id}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs",
              activeLayerId === l.id && "bg-accent/60",
            )}
          >
            <button
              type="button"
              className="flex-1 text-left text-foreground"
              onClick={() => setActiveLayerId(l.id)}
            >
              {l.name}
            </button>
            <button
              type="button"
              aria-label={`Toggle visibility of ${l.name}`}
              onClick={() => toggleLayer(l.id, "visible")}
              className="text-muted-foreground hover:text-foreground"
            >
              {l.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              aria-label={`Toggle lock of ${l.name}`}
              onClick={() => toggleLayer(l.id, "locked")}
              className="text-muted-foreground hover:text-foreground"
            >
              {l.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
