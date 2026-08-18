import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { Circle, Layer, Line, Rect, Stage, Text as KText } from "react-konva";
import {
  createDimension,
  createDoor,
  createRoom,
  createText,
  createWall,
  createWindow,
  DEFAULTS,
} from "@/domain/factories";
import type { FloorPlanObject, Point } from "@/domain/types";
import { LAYER_IDS } from "@/domain/types";
import { screenToWorld, wheelZoom } from "@/geometry/coordinates";
import { snapPoint } from "@/geometry/snapping";
import { distance, midpoint } from "@/geometry/distance";
import { findObject, useEditorStore } from "@/state/floorPlanStore";
import { hitTest, translateObject } from "@/tools/selectTool";
import { resolveWallEnd } from "@/tools/wallTool";
import { rectFromPoints } from "@/tools/roomTool";
import { rotationFromNearestWall } from "@/tools/doorTool";
import { promptForText } from "@/tools/textTool";
import { registerStage } from "@/exporters";
import { GridLayer } from "./GridLayer";
import { WallsLayer } from "./WallsLayer";
import { RoomsLayer } from "./RoomsLayer";
import { DoorsLayer } from "./DoorsLayer";
import { WindowsLayer } from "./WindowsLayer";
import { DimensionsLayer } from "./DimensionsLayer";
import { TextLayer } from "./TextLayer";
import { CANVAS } from "./palette";

interface Draft {
  start: Point;
  current: Point;
}

export default function FloorPlanCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [snapKind, setSnapKind] = useState<string>("none");
  const panRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: string; last: Point } | null>(null);

  const plan = useEditorStore((s) => s.floorPlan);
  const viewport = useEditorStore((s) => s.viewport);
  const setViewport = useEditorStore((s) => s.setViewport);
  const tool = useEditorStore((s) => s.activeTool);
  const mode = useEditorStore((s) => s.mode);
  const grid = useEditorStore((s) => s.gridSettings);
  const snapSettings = useEditorStore((s) => s.snapSettings);
  const ortho = useEditorStore((s) => s.orthoMode);
  const selected = useEditorStore((s) => s.selectedObjectIds);
  const setSelection = useEditorStore((s) => s.setSelection);
  const addObject = useEditorStore((s) => s.addObject);
  const setCursorWorld = useEditorStore((s) => s.setCursorWorld);
  const beginTransaction = useEditorStore((s) => s.beginTransaction);
  const setPlanTransient = useEditorStore((s) => s.setPlanTransient);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setSize({ width: Math.max(r.width, 1), height: Math.max(r.height, 1) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    registerStage(stageRef.current);
    return () => registerStage(null);
  }, []);

  const pointer = useCallback((): Point => {
    const p = stageRef.current?.getPointerPosition();
    return p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
  }, []);

  const worldAt = useCallback(
    (screen: Point) => {
      const raw = screenToWorld(screen, viewport);
      const res = snapPoint(raw, plan, snapSettings);
      return res;
    },
    [viewport, plan, snapSettings],
  );

  // Non-passive wheel listener for zoom (React onWheel is passive).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setViewport(
        wheelZoom(useEditorStore.getState().viewport, screen, e.deltaY, e.deltaMode),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setViewport]);

  const finish = (obj: FloorPlanObject | null) => {
    if (obj) addObject(obj);
    setDraft(null);
  };

  const handleDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    const screen = pointer();
    const isPan = e.evt.button === 1 || e.evt.button === 2 || tool === "select" ? false : false;
    void isPan;
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey && tool === "select")) {
      panRef.current = screen;
      return;
    }
    if (e.evt.button !== 0) return;
    const { point } = worldAt(screen);

    if (mode === "view" || tool === "select") {
      const tol = 12 / viewport.zoom;
      const id = hitTest(plan, point, tol);
      setSelection(id ? [id] : []);
      if (id && mode === "design") {
        beginTransaction();
        dragRef.current = { id, last: point };
      }
      return;
    }

    switch (tool) {
      case "wall":
      case "room":
      case "dimension":
      case "measure":
        setDraft({ start: point, current: point });
        break;
      case "door":
        finish(
          createDoor(point, rotationFromNearestWall(plan, point), DEFAULTS.doorWidth, "left"),
        );
        break;
      case "window":
        finish(createWindow(point, rotationFromNearestWall(plan, point)));
        break;
      case "text": {
        const value = promptForText();
        if (value) finish(createText(point, value));
        break;
      }
    }
  };

  const handleMove = () => {
    const screen = pointer();
    if (panRef.current) {
      const dx = screen.x - panRef.current.x;
      const dy = screen.y - panRef.current.y;
      panRef.current = screen;
      const vp = useEditorStore.getState().viewport;
      setViewport({ ...vp, x: vp.x + dx, y: vp.y + dy });
      return;
    }
    const res = worldAt(screen);
    setSnapKind(res.kind);
    setCursorWorld(res.point);

    if (dragRef.current) {
      const { id, last } = dragRef.current;
      const dx = res.point.x - last.x;
      const dy = res.point.y - last.y;
      if (dx || dy) {
        dragRef.current = { id, last: res.point };
        setPlanTransient((p) => {
          const obj = findObject(p, id);
          if (!obj) return p;
          const moved = translateObject(obj, dx, dy);
          const key = (
            {
              wall: "walls",
              door: "doors",
              window: "windows",
              room: "rooms",
              dimension: "dimensions",
              text: "texts",
            } as const
          )[obj.type];
          return {
            ...p,
            [key]: (p[key] as FloorPlanObject[]).map((o) => (o.id === id ? moved : o)),
          };
        });
      }
      return;
    }

    if (draft) {
      const next =
        tool === "wall" || tool === "dimension" || tool === "measure"
          ? resolveWallEnd(draft.start, res.point, ortho)
          : res.point;
      setDraft({ ...draft, current: next });
    }
  };

  const handleUp = () => {
    panRef.current = null;
    dragRef.current = null;
    if (!draft) return;
    const { start, current } = draft;
    if (tool === "wall") {
      if (distance(start, current) > 1) finish(createWall(start, current));
      else setDraft(null);
      return;
    }
    if (tool === "room") {
      const r = rectFromPoints(start, current);
      if (r.width > 1 && r.height > 1) finish(createRoom(r.position, r.width, r.height));
      else setDraft(null);
      return;
    }
    if (tool === "dimension") {
      if (distance(start, current) > 1) finish(createDimension(start, current));
      else setDraft(null);
      return;
    }
    setDraft(null);
  };

  const layerVisible = (id: string) =>
    plan.layers.find((l) => l.id === id)?.visible ?? true;

  const selectedObjects = selected
    .map((id) => findObject(plan, id))
    .filter(Boolean) as FloorPlanObject[];

  const measureInfo =
    draft && tool === "measure"
      ? { len: Math.round(distance(draft.start, draft.current)), mid: midpoint(draft.start, draft.current) }
      : null;

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: CANVAS.background, cursor: tool === "select" ? "default" : "crosshair" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
      >
        <GridLayer
          viewport={viewport}
          size={size}
          spacing={grid.spacing}
          majorEvery={grid.majorEvery}
          visible={grid.visible}
        />
        <Layer
          x={viewport.x}
          y={viewport.y}
          scaleX={viewport.zoom}
          scaleY={viewport.zoom}
          listening={false}
        >
          {layerVisible(LAYER_IDS.rooms) && <RoomsLayer rooms={plan.rooms} />}
          {layerVisible(LAYER_IDS.walls) && <WallsLayer walls={plan.walls} />}
          {layerVisible(LAYER_IDS.doors) && <DoorsLayer doors={plan.doors} />}
          {layerVisible(LAYER_IDS.windows) && <WindowsLayer windows={plan.windows} />}
          {layerVisible(LAYER_IDS.dimensions) && (
            <DimensionsLayer dimensions={plan.dimensions} />
          )}
          {layerVisible(LAYER_IDS.annotations) && <TextLayer texts={plan.texts} />}

          {/* selection highlight */}
          {selectedObjects.map((o) => {
            const sw = 3 / viewport.zoom;
            if (o.type === "wall" || o.type === "dimension") {
              return (
                <Line
                  key={`sel-${o.id}`}
                  points={[o.start.x, o.start.y, o.end.x, o.end.y]}
                  stroke={CANVAS.selection}
                  strokeWidth={Math.max(sw * 30, 60)}
                  opacity={0.5}
                  lineCap="round"
                />
              );
            }
            if (o.type === "room") {
              return (
                <Rect
                  key={`sel-${o.id}`}
                  x={o.position.x}
                  y={o.position.y}
                  width={o.width}
                  height={o.height}
                  stroke={CANVAS.selection}
                  strokeWidth={60}
                  dash={[200, 150]}
                />
              );
            }
            const r = "width" in o ? o.width / 2 + 100 : 300;
            return (
              <Circle
                key={`sel-${o.id}`}
                x={o.position.x}
                y={o.position.y}
                radius={r}
                stroke={CANVAS.selection}
                strokeWidth={50}
              />
            );
          })}

          {/* draft preview */}
          {draft && (tool === "wall" || tool === "dimension" || tool === "measure") && (
            <Line
              points={[draft.start.x, draft.start.y, draft.current.x, draft.current.y]}
              stroke={tool === "measure" ? CANVAS.measure : CANVAS.preview}
              strokeWidth={tool === "wall" ? DEFAULTS.wallThickness : 40}
              dash={tool === "wall" ? undefined : [200, 150]}
              opacity={0.7}
            />
          )}
          {draft && tool === "room" && (
            <Rect
              {...(() => {
                const r = rectFromPoints(draft.start, draft.current);
                return { x: r.position.x, y: r.position.y, width: r.width, height: r.height };
              })()}
              stroke={CANVAS.preview}
              strokeWidth={50}
              dash={[200, 150]}
            />
          )}
          {measureInfo && (
            <KText
              x={measureInfo.mid.x}
              y={measureInfo.mid.y - 400}
              text={`${measureInfo.len} mm`}
              fontSize={350}
              fill={CANVAS.measure}
            />
          )}
        </Layer>
      </Stage>

      <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 font-mono text-[11px] text-white">
        snap: {snapKind}
      </div>
    </div>
  );
}
