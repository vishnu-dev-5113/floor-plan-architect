import { create } from "zustand";
import { sampleFloorPlan } from "@/domain/sample";
import { emptyFloorPlan, DEFAULTS } from "@/domain/factories";
import type { FloorPlan, FloorPlanObject } from "@/domain/types";
import type { Viewport } from "@/geometry/coordinates";
import { BASE_ZOOM } from "@/geometry/coordinates";
import type { SnapSettings } from "@/geometry/snapping";
import {
  emptyHistory,
  pushHistory,
  redo as redoHistory,
  undo as undoHistory,
  type History,
} from "@/history/historyManager";

export type ToolId =
  | "select"
  | "wall"
  | "door"
  | "window"
  | "room"
  | "dimension"
  | "measure"
  | "text";

export type EditorMode = "design" | "view";

export interface GridSettings {
  visible: boolean;
  spacing: number;
  majorEvery: number;
}

interface StoreState {
  // domain state
  floorPlan: FloorPlan;
  history: History;
  // ui state
  activeTool: ToolId;
  selectedObjectIds: string[];
  viewport: Viewport;
  gridSettings: GridSettings;
  snapSettings: SnapSettings;
  orthoMode: boolean;
  activeLayerId: string;
  mode: EditorMode;
  cursorWorld: { x: number; y: number };

  // actions
  commit: (updater: (plan: FloorPlan) => FloorPlan) => void;
  setPlanTransient: (updater: (plan: FloorPlan) => FloorPlan) => void;
  beginTransaction: () => void;
  loadPlan: (plan: FloorPlan, opts?: { resetHistory?: boolean }) => void;
  newPlan: () => void;
  addObject: (obj: FloorPlanObject) => void;
  updateObject: (id: string, patch: Record<string, unknown>) => void;
  deleteObjects: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
  setActiveTool: (t: ToolId) => void;
  setSelection: (ids: string[]) => void;
  setViewport: (vp: Viewport) => void;
  setGridSettings: (patch: Partial<GridSettings>) => void;
  setSnapSettings: (patch: Partial<SnapSettings>) => void;
  setOrthoMode: (v: boolean) => void;
  setActiveLayerId: (id: string) => void;
  setMode: (m: EditorMode) => void;
  setCursorWorld: (p: { x: number; y: number }) => void;
  toggleLayer: (id: string, key: "visible" | "locked") => void;
  isLayerLocked: (layerId: string) => boolean;
}

const COLLECTIONS = [
  "walls",
  "doors",
  "windows",
  "rooms",
  "dimensions",
  "texts",
] as const;

function touch(plan: FloorPlan): FloorPlan {
  return { ...plan, metadata: { ...plan.metadata, updatedAt: new Date().toISOString() } };
}

export function findObject(plan: FloorPlan, id: string): FloorPlanObject | undefined {
  for (const key of COLLECTIONS) {
    const found = (plan[key] as FloorPlanObject[]).find((o) => o.id === id);
    if (found) return found;
  }
  return undefined;
}

export const useEditorStore = create<StoreState>((set, get) => ({
  floorPlan: sampleFloorPlan(),
  history: emptyHistory(),
  activeTool: "select",
  selectedObjectIds: [],
  viewport: { x: 80, y: 80, zoom: BASE_ZOOM * 0.5 },
  gridSettings: { visible: true, spacing: DEFAULTS.gridSpacing, majorEvery: 10 },
  snapSettings: {
    enabled: true,
    grid: true,
    endpoints: true,
    midpoints: true,
    gridSpacing: DEFAULTS.gridSpacing,
    threshold: 250,
  },
  orthoMode: true,
  activeLayerId: "layer-walls",
  mode: "design",
  cursorWorld: { x: 0, y: 0 },

  commit: (updater) =>
    set((s) => ({
      floorPlan: touch(updater(s.floorPlan)),
      history: pushHistory(s.history, s.floorPlan),
    })),

  setPlanTransient: (updater) => set((s) => ({ floorPlan: updater(s.floorPlan) })),

  beginTransaction: () =>
    set((s) => ({ history: pushHistory(s.history, s.floorPlan) })),

  loadPlan: (plan, opts) =>
    set((s) => ({
      floorPlan: plan,
      selectedObjectIds: [],
      history: opts?.resetHistory ? emptyHistory() : pushHistory(s.history, s.floorPlan),
    })),

  newPlan: () =>
    set((s) => ({
      floorPlan: emptyFloorPlan(),
      selectedObjectIds: [],
      history: pushHistory(s.history, s.floorPlan),
    })),

  addObject: (obj) =>
    get().commit((plan) => {
      const key =
        obj.type === "wall"
          ? "walls"
          : obj.type === "door"
            ? "doors"
            : obj.type === "window"
              ? "windows"
              : obj.type === "room"
                ? "rooms"
                : obj.type === "dimension"
                  ? "dimensions"
                  : "texts";
      return { ...plan, [key]: [...(plan[key] as FloorPlanObject[]), obj] } as FloorPlan;
    }),

  updateObject: (id, patch) =>
    get().commit((plan) => {
      const next = { ...plan };
      for (const key of COLLECTIONS) {
        next[key] = (plan[key] as FloorPlanObject[]).map((o) =>
          o.id === id ? { ...o, ...patch } : o,
        ) as never;
      }
      return next;
    }),

  deleteObjects: (ids) => {
    if (ids.length === 0) return;
    get().commit((plan) => {
      const next = { ...plan };
      for (const key of COLLECTIONS) {
        next[key] = (plan[key] as FloorPlanObject[]).filter(
          (o) => !ids.includes(o.id),
        ) as never;
      }
      return next;
    });
    set({ selectedObjectIds: [] });
  },

  undo: () =>
    set((s) => {
      const res = undoHistory(s.history, s.floorPlan);
      return res ? { floorPlan: res.plan, history: res.history, selectedObjectIds: [] } : {};
    }),

  redo: () =>
    set((s) => {
      const res = redoHistory(s.history, s.floorPlan);
      return res ? { floorPlan: res.plan, history: res.history, selectedObjectIds: [] } : {};
    }),

  setActiveTool: (activeTool) => set({ activeTool, selectedObjectIds: [] }),
  setSelection: (selectedObjectIds) => set({ selectedObjectIds }),
  setViewport: (viewport) => set({ viewport }),
  setGridSettings: (patch) =>
    set((s) => ({
      gridSettings: { ...s.gridSettings, ...patch },
      snapSettings: patch.spacing
        ? { ...s.snapSettings, gridSpacing: patch.spacing }
        : s.snapSettings,
    })),
  setSnapSettings: (patch) => set((s) => ({ snapSettings: { ...s.snapSettings, ...patch } })),
  setOrthoMode: (orthoMode) => set({ orthoMode }),
  setActiveLayerId: (activeLayerId) => set({ activeLayerId }),
  setMode: (mode) => set({ mode, selectedObjectIds: [], activeTool: mode === "view" ? "select" : "select" }),
  setCursorWorld: (cursorWorld) => set({ cursorWorld }),

  toggleLayer: (id, key) =>
    set((s) => ({
      floorPlan: {
        ...s.floorPlan,
        layers: s.floorPlan.layers.map((l) =>
          l.id === id ? { ...l, [key]: !l[key] } : l,
        ),
      },
    })),

  isLayerLocked: (layerId) =>
    get().floorPlan.layers.find((l) => l.id === layerId)?.locked ?? false,
}));