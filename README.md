# Floor Plan Architect

Build a 2D House Plan / CAD-Style Floor Plan Editor

Build a desktop-first web application for creating, editing, viewing, saving, and exporting 2D architectural house/floor plans.

This is a functional POC, not a marketing website or a generic drawing/whiteboard application.

The application should behave like a lightweight 2D CAD/floor-plan editor.

The user must be able to:

View a 2D house plan

Create/draft a 2D house plan

Draw walls

Add doors

Add windows

Create rooms

Add dimensions

Measure distances

Add text annotations

Select and modify objects

Delete objects

Zoom and pan

Use a grid

Snap objects to the grid and existing geometry

Undo/redo changes

Save/load the floor plan

Export the floor plan

Prepare the floor plan for CAD formats such as DXF/DWG

1. Technology Stack

Use:

React

Vite

TypeScript

npm

react-konva

konva

Zustand for application state if state management is needed

Install:

npm install konva react-konva zustand


Use React-Konva + Konva as the 2D rendering and interaction engine.

Do NOT use:

Fabric.js

PixiJS

Paper.js

Three.js

another canvas rendering framework

The primary drawing engine must be Konva.

2. MOST IMPORTANT ARCHITECTURAL REQUIREMENT

The application must use a domain-based FloorPlan JSON model as the single source of truth.

The architecture must be:

                  FloorPlan JSON
                       │
          ┌────────────┴────────────┐
          │                         │
          ↓                         ↓
   Konva Renderer             Export/Import
          │                         │
          ↓                  ┌──────┼──────┐
      2D Editor              ↓      ↓      ↓
                           JSON    DXF    DWG


Konva must NOT be the source of truth.

Do NOT make the serialized Konva Stage the application's main project format.

Do NOT design the application around Konva's internal node structure.

The application domain model must be independent of Konva.

This is extremely important because the same FloorPlan JSON must eventually be usable for:

Konva rendering

SVG export

PNG export

DXF export

DWG export/conversion

backend persistence

future database storage

future 3D conversion

3. FloorPlan Domain Model

Create a strongly typed domain model.

Example:

interface FloorPlan {
  id: string;
  name: string;

  version: number;

  units: "mm" | "cm" | "m";

  walls: Wall[];
  doors: Door[];
  windows: Window[];
  rooms: Room[];
  dimensions: Dimension[];
  texts: TextObject[];

  layers: Layer[];

  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}


All architectural objects must have unique IDs.

Example wall:

interface Wall {
  id: string;
  type: "wall";

  start: {
    x: number;
    y: number;
  };

  end: {
    x: number;
    y: number;
  };

  thickness: number;

  layerId: string;
}


Use millimeters as the internal coordinate system.

For example:

Wall:
start = { x: 0, y: 0 }
end   = { x: 4000, y: 0 }

Length = 4000 mm


Never use screen pixels as the actual architectural measurement.

4. Coordinate System

Implement a proper CAD-style world coordinate system.

There must be two coordinate systems:

World coordinates
       ↓
Viewport transformation
       ↓
Screen coordinates


And the reverse:

Mouse screen coordinates
       ↓
Inverse viewport transformation
       ↓
World coordinates


Create reusable geometry utilities:

worldToScreen()
screenToWorld()
distance()
angle()
snapPoint()


The viewport should contain:

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}


5. Application Layout

Create a professional CAD-style desktop interface.

┌─────────────────────────────────────────────────────────────────────┐
│ File │ Edit │ View │ Draw │ Tools │ Export                          │
├─────────────────────────────────────────────────────────────────────┤
│ Select │ Wall │ Door │ Window │ Room │ Dimension │ Measure │ Text  │
├───────────────┬────────────────────────────────────┬────────────────┤
│               │                                    │                │
│ Tool /        │                                    │ Properties     │
│ Layers        │          2D DRAWING AREA           │                │
│               │                                    │                │
│               │          Grid + Floor Plan         │                │
│               │                                    │                │
├───────────────┴────────────────────────────────────┴────────────────┤
│ X: 1200 mm │ Y: 850 mm │ Zoom: 100% │ Snap: ON │ Units: mm         │
└─────────────────────────────────────────────────────────────────────┘


Open directly into the editor.

Do not create a landing page.

6. Konva Rendering Architecture

Use the following conceptual layers:

Konva Stage
│
├── Grid Layer
├── Floor Plan Layer
├── Dimensions Layer
├── Selection Layer
└── Preview Layer


Suggested React components:

FloorPlanCanvas
├── GridLayer
├── WallsLayer
├── DoorsLayer
├── WindowsLayer
├── RoomsLayer
├── DimensionsLayer
├── TextLayer
├── SelectionLayer
└── PreviewLayer


Each renderer receives objects from FloorPlan JSON.

Example:

FloorPlan.walls
      ↓
WallsLayer
      ↓
Konva Line / Shape


Do not store independent architectural data inside the Konva nodes.

7. Grid

Implement a CAD-style grid.

Requirements:

visible grid

major/minor grid

configurable spacing

grid toggle

snap toggle

grid remains usable at different zoom levels

Default:

Grid spacing = 100 mm


The grid must be generated from world coordinates.

8. Zoom and Pan

Implement:

mouse wheel zoom

zoom around cursor

zoom in

zoom out

fit drawing

reset view

pan

zoom percentage display

Toolbar:

[-] 100% [+] [Fit]


Use viewport transformations.

Do not modify every object's world coordinates when zooming or panning.

9. Wall Tool

The Wall tool is the primary drawing feature.

Workflow:

Select Wall
     ↓
Click start point
     ↓
Move mouse
     ↓
Preview wall
     ↓
Click end point
     ↓
Create Wall in FloorPlan JSON
     ↓
Konva automatically renders updated model


Default:

Wall thickness = 200 mm


Support:

horizontal

vertical

arbitrary angle

orthogonal mode

endpoint snapping

grid snapping

selection

moving

editing

deleting

Wall length must be calculated from geometry.

Do not store manually entered length as the authoritative value.

10. Orthogonal Drawing

Provide an orthogonal mode.

When enabled, constrain wall angles to:

0°
90°
180°
270°


Allow the user to toggle it from the toolbar.

11. Selection

Implement a Select tool.

Users can:

select objects

move objects

delete objects

inspect properties

edit properties

Selected objects should have a clear visual highlight.

Maintain:

selectedObjectIds: string[]


Do not make Konva selection state the application source of truth.

12. Door

Create architectural door objects.

Model:

interface Door {
  id: string;
  type: "door";

  position: {
    x: number;
    y: number;
  };

  width: number;

  rotation: number;

  swing: "left" | "right";

  layerId: string;
}


Default:

900 mm


Render:

door leaf

opening/swing arc

Allow:

move

rotate

change width

change swing

delete

13. Window

Model:

interface Window {
  id: string;
  type: "window";

  position: {
    x: number;
    y: number;
  };

  width: number;

  rotation: number;

  layerId: string;
}


Default:

1200 mm


Render using a simple architectural window symbol.

14. Room

V1 should support rectangular rooms.

Properties:

name

width

height

area

position

Example:

Living Room

5000 × 4000 mm

Area: 20.00 m²


Area must be calculated from geometry.

The room label should be rendered on the drawing.

15. Dimension Tool

Implement basic architectural dimensions.

Workflow:

Click point A
     ↓
Click point B
     ↓
Create Dimension object


Display:

<────────────────>
      4000 mm


Support:

horizontal

vertical

aligned dimensions where practical

Dimension values must be calculated from world coordinates.

Example:

interface Dimension {
  id: string;
  type: "dimension";

  start: Point;
  end: Point;

  offset: number;

  layerId: string;
}


Do not store only the displayed string "4000 mm".

16. Measurement Tool

Implement temporary measurement.

Display:

Distance: 4250 mm
Angle: 90°


Measurement should be calculated from world geometry.

17. Text Tool

Allow text annotations.

Properties:

text

position

font size

rotation

alignment

Example:

MASTER BEDROOM


18. Properties Panel

When selecting an object, display editable properties.

Example wall:

WALL

Start X     0 mm
Start Y     0 mm

End X       4000 mm
End Y       0 mm

Length      4000 mm

Thickness   200 mm

[Apply]
[Delete]


When a property changes:

Properties
    ↓
FloorPlan JSON
    ↓
React state update
    ↓
Konva rerender


Never directly modify Konva nodes as the only state update.

19. Snapping System

Create a reusable geometry snapping system.

Support:

Grid snap

397 mm → 400 mm
403 mm → 400 mm


Endpoint snap

Snap to existing wall endpoints.

Midpoint snap

Snap to the midpoint of walls.

Create reusable logic:

snapPoint(
  point,
  floorPlan,
  snapSettings
)


Keep snapping logic independent from React and Konva.

20. Undo / Redo

Implement:

Ctrl + Z
Ctrl + Y


Track changes to the FloorPlan model.

Undo/redo must cover:

create

delete

move

resize

edit properties

rooms

doors

windows

dimensions

text

The history should operate on domain-state changes, not Konva node state.

21. Layers

Create:

Walls
Doors
Windows
Rooms
Dimensions
Annotations
Furniture


Each layer:

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}


Allow:

show/hide

lock/unlock

active layer

Locked layers cannot be edited.

22. FloorPlan JSON Persistence

The JSON model is the primary project format for V1.

Implement:

New
Open JSON
Save JSON
Save As JSON


Example:

{
  "version": 1,
  "units": "mm",
  "walls": [],
  "doors": [],
  "windows": [],
  "rooms": [],
  "dimensions": [],
  "texts": [],
  "layers": []
}


Validate imported JSON before loading it.

If invalid:

Invalid floor plan file.


Do not crash the application.

23. localStorage

For V1, automatically persist the current FloorPlan JSON to localStorage.

Use localStorage only as a convenience/autosave mechanism.

The actual canonical project representation remains the FloorPlan JSON object.

24. Export Architecture

Create a dedicated export abstraction:

interface FloorPlanExporter {
  exportJSON(plan: FloorPlan): Blob;
  exportSVG(plan: FloorPlan): Blob;
  exportPNG(plan: FloorPlan): Blob;
  exportDXF(plan: FloorPlan): Promise<Blob>;
  exportDWG(plan: FloorPlan): Promise<Blob>;
}


The important requirement is:

FloorPlan JSON
      │
      ├── JSON Exporter
      ├── SVG Exporter
      ├── PNG Exporter
      ├── DXF Exporter
      └── DWG Exporter


Do not convert:

Konva → DWG


Instead:

FloorPlan JSON → DWG


This is a critical architectural requirement.

25. PNG Export

Use Konva's export functionality where appropriate.

The PNG should represent the visible floor plan.

Allow export of the drawing area.

26. SVG Export

Create SVG directly from the FloorPlan model.

Do not simply screenshot the Konva canvas.

For example:

Wall → SVG line/path
Door → SVG line/path/arc
Window → SVG elements
Dimension → SVG lines + text
Room → SVG shape + text


This ensures the SVG remains vector-based.

27. DXF Export

Create a dedicated DXF exporter.

The exporter must read the FloorPlan model.

Example mapping:

Wall       → LINE / POLYLINE
Window     → LINE / POLYLINE
Door       → LINE + ARC
Dimension  → LINE + TEXT
Text       → TEXT


Do not couple this implementation to Konva.

If full DXF support requires an additional open-source package, evaluate and use an appropriate MIT/BSD/GPL-compatible library only if its license is compatible with this POC.

Document the selected dependency and its license.

28. DWG Export

DWG is NOT the foundation of the application.

Do not make the editor depend on DWG.

Create a dedicated DWG export interface:

exportDWG(plan: FloorPlan): Promise<Blob>


The implementation should be isolated.

Do not:

rename DXF to DWG

rename SVG to DWG

generate a fake DWG

create an invalid DWG file

If reliable browser-side DWG generation is not possible with open-source tooling, implement the exporter as a clearly isolated service adapter/stub and display:

DWG export requires the CAD conversion service.


The rest of the application must work normally without DWG.

Design the API so that a backend DWG conversion service can be added later.

29. Future CAD Conversion Architecture

Prepare for this future architecture:

React Application
       │
       ↓
FloorPlan JSON
       │
       ↓
Backend CAD Service
       │
       ├── DXF
       └── DWG


The frontend should not need to understand the internal DWG binary format.

Possible future endpoint:

POST /api/cad/export/dwg


Request:

{
  "floorPlan": {}
}


Response:

application/acad


Do not implement a backend unless required for the current POC.

Just make the frontend architecture ready for it.

30. Import Architecture

Create:

interface FloorPlanImporter {
  importJSON(file: File): Promise<FloorPlan>;
  importSVG(file: File): Promise<FloorPlan>;
  importDXF(file: File): Promise<FloorPlan>;
  importDWG(file: File): Promise<FloorPlan>;
}


The import pipeline should be:

CAD file
   ↓
Importer
   ↓
FloorPlan JSON
   ↓
Konva Renderer


Never make:

DWG → Konva objects directly


The FloorPlan model must remain the intermediate representation.

For V1, prioritize:

JSON import

JSON export

SVG export

PNG export

DXF architecture

DWG architecture

Actual DWG import/export can be connected through a backend converter later.

31. View Mode

Implement two modes:

[ Design ] [ View ]


Design

Allow:

create

edit

delete

move

dimensions

measurements

View

Allow:

zoom

pan

layer visibility

measurements

Disable editing in View mode.

32. Sample Floor Plan

Preload a realistic sample plan.

Example:

┌───────────────────────────────────┐
│                                   │
│          LIVING ROOM              │
│                                   │
│                         ┌─────────┤
│                         │ BEDROOM │
│                         │         │
│                         └─────────┤
│                                   │
│          KITCHEN                  │
│                                   │
└───────────────────┬───────────────┘
                    │
                  ENTRY


Include:

walls

doors

windows

room labels

dimensions

Use realistic millimeter measurements.

33. Project Structure

Use a modular architecture:

src/
├── components/
│   ├── layout/
│   ├── toolbar/
│   ├── properties/
│   ├── layers/
│   └── statusBar/
│
├── canvas/
│   ├── FloorPlanCanvas.tsx
│   ├── GridLayer.tsx
│   ├── WallsLayer.tsx
│   ├── DoorsLayer.tsx
│   ├── WindowsLayer.tsx
│   ├── RoomsLayer.tsx
│   ├── DimensionsLayer.tsx
│   ├── TextLayer.tsx
│   ├── SelectionLayer.tsx
│   └── PreviewLayer.tsx
│
├── domain/
│   ├── floorPlan.ts
│   ├── wall.ts
│   ├── door.ts
│   ├── window.ts
│   ├── room.ts
│   ├── dimension.ts
│   ├── text.ts
│   └── layer.ts
│
├── geometry/
│   ├── coordinates.ts
│   ├── distance.ts
│   ├── angle.ts
│   ├── snapping.ts
│   └── intersections.ts
│
├── tools/
│   ├── selectTool.ts
│   ├── wallTool.ts
│   ├── doorTool.ts
│   ├── windowTool.ts
│   ├── roomTool.ts
│   ├── dimensionTool.ts
│   ├── measureTool.ts
│   └── textTool.ts
│
├── state/
│   └── floorPlanStore.ts
│
├── history/
│   └── historyManager.ts
│
├── importers/
│   ├── jsonImporter.ts
│   ├── svgImporter.ts
│   ├── dxfImporter.ts
│   └── dwgImporter.ts
│
├── exporters/
│   ├── jsonExporter.ts
│   ├── svgExporter.ts
│   ├── pngExporter.ts
│   ├── dxfExporter.ts
│   └── dwgExporter.ts
│
└── utils/


Do not put the entire application into App.tsx.

34. State Management

Use Zustand.

Store:

floorPlan
activeTool
selectedObjectIds
viewport
gridSettings
snapSettings
activeLayerId
history
mode


Separate:

Domain state


from:

UI state


The FloorPlan object must remain serializable.

35. Keyboard Shortcuts

Implement:

V → Select
W → Wall
D → Door
N → Window
R → Room
M → Measure
T → Text

Delete / Backspace → Delete selected object

Ctrl + Z → Undo
Ctrl + Y → Redo

Esc → Cancel current operation

Space + drag → Pan

Mouse wheel → Zoom


36. Performance

The editor should remain responsive with hundreds or thousands of 2D objects.

Requirements:

use appropriate Konva layers

avoid unnecessary React rerenders

use refs for transient mouse state where appropriate

avoid unnecessary global state updates on every mousemove

disable hit detection for purely visual/static grid elements where appropriate

keep geometry calculations separate from rendering

37. Error Handling

Handle:

invalid JSON

unsupported file versions

malformed floor-plan data

invalid geometry

failed exports

unsupported DXF/DWG entities

unsupported CAD versions

Never silently fail.

Show user-friendly error messages.

38. UI Requirements

Make the interface professional and compact.

Do NOT create:

marketing pages

pricing pages

landing page

unnecessary animations

large hero sections

excessive card layouts

The editor should be the main application.

Use:

compact toolbar

clear icons with tooltips

properties panel

layer panel

status bar

keyboard shortcuts

professional CAD-like workspace

39. Acceptance Criteria

V1 is successful when the user can:

Viewing

Open a sample house plan.

Zoom.

Pan.

Fit drawing to screen.

Toggle layers.

Switch to View mode.

Drafting

Create walls.

Draw horizontal walls.

Draw vertical walls.

Draw angled walls.

Use orthogonal mode.

Snap to grid.

Snap to endpoints.

Add doors.

Add windows.

Add rooms.

Add text.

Add dimensions.

Measure distances.

Editing

Select objects.

Move objects.

Modify wall thickness.

Modify door/window dimensions.

Modify room properties.

Delete objects.

Undo.

Redo.

Persistence

Save FloorPlan JSON.

Load FloorPlan JSON.

Automatically persist the current plan locally.

Export

Export JSON.

Export PNG.

Export SVG.

Have a dedicated DXF exporter architecture.

Have a dedicated DWG exporter architecture.

Never generate fake/corrupt DWG files.

Architecture

FloorPlan JSON is the single source of truth.

Konva is only the rendering/interaction layer.

Geometry logic is independent from React components.

Import/export logic is independent from Konva.

Future backend DWG conversion can be added without rewriting the editor.

40. Implementation Priority

Build in this exact order:

1. Vite + React + TypeScript
2. Application shell
3. Zustand store
4. FloorPlan domain model
5. Konva Stage
6. World coordinate system
7. Screen/world coordinate conversion
8. Grid
9. Zoom/pan
10. Wall drawing
11. Wall selection/editing
12. Grid snapping
13. Endpoint snapping
14. Doors
15. Windows
16. Rooms
17. Dimensions
18. Measurement
19. Text
20. Layers
21. Undo/redo
22. JSON save/load
23. localStorage autosave
24. SVG export
25. PNG export
26. DXF exporter abstraction
27. DWG exporter abstraction
28. View mode
29. Error handling
30. Final UI polish


Do not skip the FloorPlan domain model and build directly around Konva nodes.

The key architectural rule is:

                FLOOR PLAN JSON
                       │
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
          KONVA VIEWER      EXPORTERS
              │                 │
              ▼          ┌──────┼──────┐
          2D EDITOR      JSON   DXF    DWG


The editor must remain fully functional even when DWG conversion is not available.

Build the V1 POC around this architecture.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b6b73703-e1fd-4cad-acaf-8d310ed84edd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
