import { lazy, Suspense, useEffect } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useEditorStore, type ToolId } from "@/state/floorPlanStore";
import { Toolbar } from "./Toolbar";
import { TopBar } from "./TopBar";
import { LayersPanel } from "./LayersPanel";
import { SettingsPanel } from "./SettingsPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { StatusBar } from "./StatusBar";

const FloorPlanCanvas = lazy(() => import("@/canvas/FloorPlanCanvas"));

const KEYS: Record<string, ToolId> = {
  v: "select", w: "wall", d: "door", n: "window",
  r: "room", m: "dimension", q: "measure", t: "text",
};

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /input|textarea|select/i.test(el.tagName)) return;
      const s = useEditorStore.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? s.redo() : s.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        s.redo();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (s.selectedObjectIds.length) {
          e.preventDefault();
          s.deleteObjects(s.selectedObjectIds);
        }
        return;
      }
      if (e.key === "Escape") {
        s.setSelection([]);
        s.setActiveTool("select");
        return;
      }
      if (e.key === "F8") {
        e.preventDefault();
        s.setOrthoMode(!s.orthoMode);
        return;
      }
      const tool = KEYS[e.key.toLowerCase()];
      if (tool && !e.ctrlKey && !e.metaKey) s.setActiveTool(tool);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export function EditorShell() {
  useShortcuts();

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Toolbar />
        <main id="cad-canvas" className="relative min-w-0 flex-1">
          <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
              <FloorPlanCanvas />
            </Suspense>
          </ClientOnly>
        </main>
        <aside className="flex w-72 flex-col border-l border-border bg-panel">
          <SettingsPanel />
          <LayersPanel />
          <PropertiesPanel />
        </aside>
      </div>
      <StatusBar />
      <Toaster />
    </div>
  );
}
