import {
  createDimension,
  createDoor,
  createRoom,
  createText,
  createWall,
  createWindow,
  emptyFloorPlan,
} from "./factories";
import type { FloorPlan } from "./types";

/** A realistic 12.0 x 9.0 m sample house, all measurements in millimetres. */
export function sampleFloorPlan(): FloorPlan {
  const plan = emptyFloorPlan("Sample House");
  const W = 12000;
  const H = 9000;
  const midX = 7500;
  const midY = 5000;

  plan.walls = [
    createWall({ x: 0, y: 0 }, { x: W, y: 0 }),
    createWall({ x: W, y: 0 }, { x: W, y: H }),
    createWall({ x: W, y: H }, { x: 0, y: H }),
    createWall({ x: 0, y: H }, { x: 0, y: 0 }),
    createWall({ x: midX, y: 0 }, { x: midX, y: H }, 150),
    createWall({ x: 0, y: midY }, { x: W, y: midY }, 150),
  ];

  plan.rooms = [
    createRoom({ x: 0, y: 0 }, midX, midY, "Living Room"),
    createRoom({ x: midX, y: 0 }, W - midX, midY, "Bedroom"),
    createRoom({ x: 0, y: midY }, midX, H - midY, "Kitchen"),
    createRoom({ x: midX, y: midY }, W - midX, H - midY, "Bathroom"),
  ];

  plan.doors = [
    createDoor({ x: midX, y: 3400 }, 90, 900, "left"),
    createDoor({ x: 3000, y: midY }, 0, 900, "right"),
    createDoor({ x: 9600, y: midY }, 0, 800, "left"),
    createDoor({ x: 2000, y: H }, 0, 1000, "left"),
  ];

  plan.windows = [
    createWindow({ x: 3000, y: 0 }, 0, 1500),
    createWindow({ x: 9800, y: 0 }, 0, 1200),
    createWindow({ x: 0, y: 2500 }, 90, 1200),
    createWindow({ x: W, y: 7000 }, 90, 900),
  ];

  plan.dimensions = [
    createDimension({ x: 0, y: H }, { x: W, y: H }, 1200),
    createDimension({ x: 0, y: 0 }, { x: 0, y: H }, 1200),
  ];

  plan.texts = [createText({ x: 1200, y: H + 400 }, "ENTRY", 320)];

  return plan;
}