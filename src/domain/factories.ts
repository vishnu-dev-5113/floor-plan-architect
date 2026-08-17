import {
  FLOOR_PLAN_VERSION,
  LAYER_IDS,
  type Dimension,
  type Door,
  type FloorPlan,
  type Layer,
  type Point,
  type Room,
  type TextObject,
  type Wall,
  type WindowObject,
} from "./types";

export const uid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const DEFAULTS = {
  wallThickness: 200,
  doorWidth: 900,
  windowWidth: 1200,
  fontSize: 300,
  dimensionOffset: 600,
  gridSpacing: 100,
};

export function defaultLayers(): Layer[] {
  return [
    { id: LAYER_IDS.walls, name: "Walls", visible: true, locked: false },
    { id: LAYER_IDS.doors, name: "Doors", visible: true, locked: false },
    { id: LAYER_IDS.windows, name: "Windows", visible: true, locked: false },
    { id: LAYER_IDS.rooms, name: "Rooms", visible: true, locked: false },
    { id: LAYER_IDS.dimensions, name: "Dimensions", visible: true, locked: false },
    { id: LAYER_IDS.annotations, name: "Annotations", visible: true, locked: false },
    { id: LAYER_IDS.furniture, name: "Furniture", visible: true, locked: false },
  ];
}

export function emptyFloorPlan(name = "Untitled Plan"): FloorPlan {
  const now = new Date().toISOString();
  return {
    id: uid("plan"),
    name,
    version: FLOOR_PLAN_VERSION,
    units: "mm",
    walls: [],
    doors: [],
    windows: [],
    rooms: [],
    dimensions: [],
    texts: [],
    layers: defaultLayers(),
    metadata: { createdAt: now, updatedAt: now },
  };
}

export const createWall = (
  start: Point,
  end: Point,
  thickness = DEFAULTS.wallThickness,
  layerId = LAYER_IDS.walls,
): Wall => ({ id: uid("wall"), type: "wall", start, end, thickness, layerId });

export const createDoor = (
  position: Point,
  rotation = 0,
  width = DEFAULTS.doorWidth,
  swing: "left" | "right" = "left",
  layerId = LAYER_IDS.doors,
): Door => ({ id: uid("door"), type: "door", position, width, rotation, swing, layerId });

export const createWindow = (
  position: Point,
  rotation = 0,
  width = DEFAULTS.windowWidth,
  layerId = LAYER_IDS.windows,
): WindowObject => ({
  id: uid("win"),
  type: "window",
  position,
  width,
  rotation,
  layerId,
});

export const createRoom = (
  position: Point,
  width: number,
  height: number,
  name = "Room",
  layerId = LAYER_IDS.rooms,
): Room => ({ id: uid("room"), type: "room", name, position, width, height, layerId });

export const createDimension = (
  start: Point,
  end: Point,
  offset = DEFAULTS.dimensionOffset,
  layerId = LAYER_IDS.dimensions,
): Dimension => ({ id: uid("dim"), type: "dimension", start, end, offset, layerId });

export const createText = (
  position: Point,
  text: string,
  fontSize = DEFAULTS.fontSize,
  layerId = LAYER_IDS.annotations,
): TextObject => ({
  id: uid("text"),
  type: "text",
  position,
  text,
  fontSize,
  rotation: 0,
  align: "left",
  layerId,
});