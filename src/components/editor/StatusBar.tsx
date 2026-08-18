import { useEditorStore } from "@/state/floorPlanStore";
import { zoomPercent } from "@/geometry/coordinates";

export function StatusBar() {
  const cursor = useEditorStore((s) => s.cursorWorld);
  const zoom = useEditorStore((s) => s.viewport.zoom);
  const tool = useEditorStore((s) => s.activeTool);
  const ortho = useEditorStore((s) => s.orthoMode);
  const snap = useEditorStore((s) => s.snapSettings.enabled);
  const plan = useEditorStore((s) => s.floorPlan);

  const count =
    plan.walls.length + plan.doors.length + plan.windows.length +
    plan.rooms.length + plan.dimensions.length + plan.texts.length;

  return (
    <footer className="flex items-center gap-4 border-t border-border bg-panel px-3 py-1 font-mono text-[11px] text-muted-foreground">
      <span>X {Math.round(cursor.x)} mm</span>
      <span>Y {Math.round(cursor.y)} mm</span>
      <span>Zoom {zoomPercent(zoom)}%</span>
      <span>Tool {tool}</span>
      <span className={ortho ? "text-primary" : undefined}>ORTHO</span>
      <span className={snap ? "text-primary" : undefined}>SNAP</span>
      <span className="ml-auto">{count} objects · units mm</span>
    </footer>
  );
}
