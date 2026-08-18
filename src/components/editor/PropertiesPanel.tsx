import type { FloorPlanObject } from "@/domain/types";
import { roomArea } from "@/geometry/distance";
import { distance } from "@/geometry/distance";
import { findObject, useEditorStore } from "@/state/floorPlanStore";

function Field({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        step={step}
        value={Math.round(value * 100) / 100}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-24 rounded border border-input bg-background px-1.5 py-0.5 text-right font-mono text-foreground"
      />
    </label>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}

export function PropertiesPanel() {
  const selected = useEditorStore((s) => s.selectedObjectIds);
  const plan = useEditorStore((s) => s.floorPlan);
  const updateObject = useEditorStore((s) => s.updateObject);
  const deleteObjects = useEditorStore((s) => s.deleteObjects);

  const obj: FloorPlanObject | undefined =
    selected.length === 1 ? findObject(plan, selected[0]!) : undefined;

  return (
    <section className="flex-1 overflow-y-auto">
      <h2 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Properties
      </h2>
      {!obj && (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          {selected.length > 1
            ? `${selected.length} objects selected.`
            : "Select an object to edit its properties."}
        </p>
      )}
      {obj && (
        <div className="pb-3">
          <Readout label="Type" value={obj.type} />
          <Readout label="ID" value={obj.id} />

          {(obj.type === "wall" || obj.type === "dimension") && (
            <>
              <Field label="Start X" value={obj.start.x} onChange={(v) => updateObject(obj.id, { start: { ...obj.start, x: v } })} step={10} />
              <Field label="Start Y" value={obj.start.y} onChange={(v) => updateObject(obj.id, { start: { ...obj.start, y: v } })} step={10} />
              <Field label="End X" value={obj.end.x} onChange={(v) => updateObject(obj.id, { end: { ...obj.end, x: v } })} step={10} />
              <Field label="End Y" value={obj.end.y} onChange={(v) => updateObject(obj.id, { end: { ...obj.end, y: v } })} step={10} />
              <Readout label="Length" value={`${Math.round(distance(obj.start, obj.end))} mm`} />
            </>
          )}
          {obj.type === "wall" && (
            <Field label="Thickness" value={obj.thickness} onChange={(v) => updateObject(obj.id, { thickness: Math.max(10, v) })} step={10} />
          )}
          {obj.type === "dimension" && (
            <Field label="Offset" value={obj.offset} onChange={(v) => updateObject(obj.id, { offset: v })} step={50} />
          )}

          {(obj.type === "door" || obj.type === "window" || obj.type === "room" || obj.type === "text") && (
            <>
              <Field label="X" value={obj.position.x} onChange={(v) => updateObject(obj.id, { position: { ...obj.position, x: v } })} step={10} />
              <Field label="Y" value={obj.position.y} onChange={(v) => updateObject(obj.id, { position: { ...obj.position, y: v } })} step={10} />
            </>
          )}
          {(obj.type === "door" || obj.type === "window") && (
            <>
              <Field label="Width" value={obj.width} onChange={(v) => updateObject(obj.id, { width: Math.max(50, v) })} step={50} />
              <Field label="Rotation" value={obj.rotation} onChange={(v) => updateObject(obj.id, { rotation: v })} step={5} />
            </>
          )}
          {obj.type === "door" && (
            <label className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Swing</span>
              <select
                value={obj.swing}
                onChange={(e) => updateObject(obj.id, { swing: e.target.value })}
                className="w-24 rounded border border-input bg-background px-1.5 py-0.5 text-foreground"
              >
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            </label>
          )}
          {obj.type === "room" && (
            <>
              <label className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">Name</span>
                <input
                  value={obj.name}
                  onChange={(e) => updateObject(obj.id, { name: e.target.value })}
                  className="w-28 rounded border border-input bg-background px-1.5 py-0.5 text-foreground"
                />
              </label>
              <Field label="Width" value={obj.width} onChange={(v) => updateObject(obj.id, { width: Math.max(100, v) })} step={100} />
              <Field label="Height" value={obj.height} onChange={(v) => updateObject(obj.id, { height: Math.max(100, v) })} step={100} />
              <Readout label="Area" value={`${roomArea(obj.width, obj.height).toFixed(2)} m²`} />
            </>
          )}
          {obj.type === "text" && (
            <>
              <label className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">Text</span>
                <input
                  value={obj.text}
                  onChange={(e) => updateObject(obj.id, { text: e.target.value })}
                  className="w-28 rounded border border-input bg-background px-1.5 py-0.5 text-foreground"
                />
              </label>
              <Field label="Font size" value={obj.fontSize} onChange={(v) => updateObject(obj.id, { fontSize: Math.max(50, v) })} step={50} />
              <Field label="Rotation" value={obj.rotation} onChange={(v) => updateObject(obj.id, { rotation: v })} step={5} />
            </>
          )}

          <div className="px-3 pt-3">
            <button
              type="button"
              onClick={() => deleteObjects([obj.id])}
              className="w-full rounded-md border border-destructive/50 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
            >
              Delete object
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
