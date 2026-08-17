export interface Point {
  x: number;
  y: number;
}

export type Units = "mm" | "cm" | "m";

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface Wall {
  id: string;
  type: "wall";
  start: Point;
  end: Point;
  thickness: number;
  layerId: string;
}

export interface Door {
  id: string;
  type: "door";
  position: Point;
  width: number;
  rotation: number;
  swing: "left" | "right";
  layerId: string;
}

export interface WindowObject {
  id: string;
  type: "window";
  position: Point;
  width: number;
  rotation: number;
  layerId: string;
}

export interface Room {
  id: string;
  type: "room";
  name: string;
  position: Point;
  width: number;
  height: number;
  layerId: string;
}

export interface Dimension {
  id: string;
  type: "dimension";
  start: Point;
  end: Point;
  offset: number;
  layerId: string;
}

export interface TextObject {
  id: string;
  type: "text";
  position: Point;
  text: string;
  fontSize: number;
  rotation: number;
  align: "left" | "center" | "right";
  layerId: string;
}

export type FloorPlanObject =
  | Wall
  | Door
  | WindowObject
  | Room
  | Dimension
  | TextObject;

export interface FloorPlan {
  id: string;
  name: string;
  version: number;
  units: Units;
  walls: Wall[];
  doors: Door[];
  windows: WindowObject[];
  rooms: Room[];
  dimensions: Dimension[];
  texts: TextObject[];
  layers: Layer[];
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export const FLOOR_PLAN_VERSION = 1;

export const LAYER_IDS = {
  walls: "layer-walls",
  doors: "layer-doors",
  windows: "layer-windows",
  rooms: "layer-rooms",
  dimensions: "layer-dimensions",
  annotations: "layer-annotations",
  furniture: "layer-furniture",
} as const;