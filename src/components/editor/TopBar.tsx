import { useRef } from "react";
import { toast } from "sonner";
import { Redo2, Undo2, FilePlus2, Upload, Download, Maximize } from "lucide-react";
import { useEditorStore } from "@/state/floorPlanStore";
import { floorPlanExporter, downloadBlob, safeFileName } from "@/exporters";
import { floorPlanImporter } from "@/importers";
import { fitViewport } from "@/geometry/coordinates";
import { planBounds } from "@/geometry/distance";
import { cn } from "@/lib/utils";

const btn =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent";

export function TopBar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const plan = useEditorStore((s) => s.floorPlan);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const newPlan = useEditorStore((s) => s.newPlan);
  const loadPlan = useEditorStore((s) => s.loadPlan);
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const setViewport = useEditorStore((s) => s.setViewport);

  const base = safeFileName(plan.name);

  const run = async (label: string, fn: () => Blob | Promise<Blob>, ext: string) => {
    try {
      const blob = await fn();
      downloadBlob(blob, `${base}.${ext}`);
      toast.success(`${label} exported`);
    } catch (err) {
      toast.error((err as Error).message || `${label} export failed`);
    }
  };

  const onImport = async (file: File) => {
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const imported =
        ext === "json"
          ? await floorPlanImporter.importJSON(file)
          : ext === "svg"
            ? await floorPlanImporter.importSVG(file)
            : ext === "dxf"
              ? await floorPlanImporter.importDXF(file)
              : await floorPlanImporter.importDWG(file);
      loadPlan(imported, { resetHistory: true });
      toast.success(`Imported ${file.name}`);
    } catch (err) {
      toast.error((err as Error).message || "Import failed");
    }
  };

  const zoomFit = () => {
    const el = document.getElementById("cad-canvas");
    const rect = el?.getBoundingClientRect();
    setViewport(
      fitViewport(planBounds(plan), {
        width: rect?.width ?? 1000,
        height: rect?.height ?? 700,
      }),
    );
  };

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-border bg-panel px-3 py-2">
      <span className="mr-2 font-mono text-sm font-semibold tracking-tight text-primary">
        PLANFORGE<span className="text-muted-foreground"> / 2D CAD</span>
      </span>
      <span className="mr-3 text-xs text-muted-foreground">{plan.name}</span>

      <button type="button" className={btn} onClick={newPlan}>
        <FilePlus2 className="h-3.5 w-3.5" /> New
      </button>
      <button type="button" className={btn} onClick={() => fileRef.current?.click()}>
        <Upload className="h-3.5 w-3.5" /> Import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.svg,.dxf,.dwg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onImport(f);
          e.target.value = "";
        }}
      />

      <div className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={btn} onClick={undo} title="Undo (Ctrl+Z)">
        <Undo2 className="h-3.5 w-3.5" /> Undo
      </button>
      <button type="button" className={btn} onClick={redo} title="Redo (Ctrl+Shift+Z)">
        <Redo2 className="h-3.5 w-3.5" /> Redo
      </button>
      <button type="button" className={btn} onClick={zoomFit} title="Zoom to fit">
        <Maximize className="h-3.5 w-3.5" /> Fit
      </button>

      <div className="mx-1 h-5 w-px bg-border" />
      <Download className="h-3.5 w-3.5 text-muted-foreground" />
      <button type="button" className={btn} onClick={() => run("JSON", () => floorPlanExporter.exportJSON(plan), "json")}>JSON</button>
      <button type="button" className={btn} onClick={() => run("SVG", () => floorPlanExporter.exportSVG(plan), "svg")}>SVG</button>
      <button type="button" className={btn} onClick={() => run("PNG", () => floorPlanExporter.exportPNG(plan), "png")}>PNG</button>
      <button type="button" className={btn} onClick={() => run("DXF", () => floorPlanExporter.exportDXF(plan), "dxf")}>DXF</button>
      <button type="button" className={btn} onClick={() => run("DWG", () => floorPlanExporter.exportDWG(plan), "dwg")}>DWG</button>

      <div className="ml-auto flex items-center overflow-hidden rounded-md border border-border">
        {(["design", "view"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "px-3 py-1.5 text-xs capitalize text-muted-foreground",
              mode === m && "bg-primary/20 text-primary",
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </header>
  );
}
