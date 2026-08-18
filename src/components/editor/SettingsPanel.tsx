import { useEditorStore } from "@/state/floorPlanStore";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs text-foreground">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function SettingsPanel() {
  const grid = useEditorStore((s) => s.gridSettings);
  const setGrid = useEditorStore((s) => s.setGridSettings);
  const snap = useEditorStore((s) => s.snapSettings);
  const setSnap = useEditorStore((s) => s.setSnapSettings);
  const ortho = useEditorStore((s) => s.orthoMode);
  const setOrtho = useEditorStore((s) => s.setOrthoMode);

  return (
    <section className="border-b border-border pb-2">
      <h2 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Drafting
      </h2>
      <Row label="Grid">
        <input type="checkbox" checked={grid.visible} onChange={(e) => setGrid({ visible: e.target.checked })} />
      </Row>
      <Row label="Grid spacing (mm)">
        <input
          type="number"
          min={10}
          step={10}
          value={grid.spacing}
          onChange={(e) => setGrid({ spacing: Math.max(10, Number(e.target.value) || 10) })}
          className="w-20 rounded border border-input bg-background px-1.5 py-0.5 text-right font-mono"
        />
      </Row>
      <Row label="Snapping">
        <input type="checkbox" checked={snap.enabled} onChange={(e) => setSnap({ enabled: e.target.checked })} />
      </Row>
      <Row label="Snap to grid">
        <input type="checkbox" checked={snap.grid} onChange={(e) => setSnap({ grid: e.target.checked })} />
      </Row>
      <Row label="Snap endpoints">
        <input type="checkbox" checked={snap.endpoints} onChange={(e) => setSnap({ endpoints: e.target.checked })} />
      </Row>
      <Row label="Snap midpoints">
        <input type="checkbox" checked={snap.midpoints} onChange={(e) => setSnap({ midpoints: e.target.checked })} />
      </Row>
      <Row label="Ortho (F8)">
        <input type="checkbox" checked={ortho} onChange={(e) => setOrtho(e.target.checked)} />
      </Row>
    </section>
  );
}
