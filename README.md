# 2D House Plan / CAD-Style Floor Plan Editor

A desktop-first React application for creating, viewing, editing, measuring, saving, and exporting 2D architectural house/floor plans.

The application is designed as a lightweight CAD-style floor-plan editor for a POC. It uses **FloorPlan JSON as the canonical source of truth**, while **Konva + React-Konva** are responsible for rendering and interacting with the drawing.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Goals of Version One](#2-goals-of-version-one)
- [3. Technology Stack](#3-technology-stack)
- [4. Core Architecture](#4-core-architecture)
- [5. FloorPlan JSON Model](#5-floorplan-json-model)
- [6. Version One Features](#6-version-one-features)
- [7. Getting Started](#7-getting-started)
- [8. Application Interface](#8-application-interface)
- [9. Working With the Drawing Canvas](#9-working-with-the-drawing-canvas)
- [10. Creating a New House Plan](#10-creating-a-new-house-plan)
- [11. Drawing Walls](#11-drawing-walls)
- [12. Adding Doors](#12-adding-doors)
- [13. Adding Windows](#13-adding-windows)
- [14. Creating Rooms](#14-creating-rooms)
- [15. Adding Dimensions](#15-adding-dimensions)
- [16. Measuring a Plan](#16-measuring-a-plan)
- [17. Adding Text and Annotations](#17-adding-text-and-annotations)
- [18. Selection and Editing](#18-selection-and-editing)
- [19. Snapping and Orthogonal Drawing](#19-snapping-and-orthogonal-drawing)
- [20. Layers](#20-layers)
- [21. Undo and Redo](#21-undo-and-redo)
- [22. View Mode and Design Mode](#22-view-mode-and-design-mode)
- [23. Saving and Loading Plans](#23-saving-and-loading-plans)
- [24. Exporting Created Drawings](#24-exporting-created-drawings)
- [25. Viewing and Editing Existing Plans](#25-viewing-and-editing-existing-plans)
- [26. Supported Plan Types in V1](#26-supported-plan-types-in-v1)
- [27. What Can Be Designed in V1](#27-what-can-be-designed-in-v1)
- [28. What V1 Does Not Support](#28-what-v1-does-not-support)
- [29. CAD / DXF / DWG Strategy](#29-cad--dxf--dwg-strategy)
- [30. Recommended Workflow](#30-recommended-workflow)
- [31. Project Structure](#31-project-structure)
- [32. Data Flow](#32-data-flow)
- [33. Future Enhancements](#33-future-enhancements)
- [34. POC Limitations](#34-poc-limitations)
- [35. Conclusion](#35-conclusion)

---

# 1. Project Overview

The **2D House Plan / CAD-Style Floor Plan Editor** is a browser-based application for drafting and viewing residential 2D floor plans.

The primary purpose of Version One is to provide a practical drawing workspace where a user can create a floor plan using architectural primitives such as:

- Walls
- Doors
- Windows
- Rooms
- Dimensions
- Text annotations
- Measurement tools
- Layers

The application is not intended to replace AutoCAD or other professional architectural CAD software in Version One.

Instead, it provides the core functionality required for a lightweight 2D house-plan drafting POC.

The editor is based on a **world-coordinate system using millimeters**, allowing dimensions to represent real architectural measurements rather than browser pixels.

---

# 2. Goals of Version One

The main goals of V1 are:

1. Provide a CAD-style 2D drawing workspace.
2. Allow users to create basic residential floor plans.
3. Allow users to open and edit plans stored in the application's JSON format.
4. Provide accurate world-coordinate geometry.
5. Support walls, doors, windows, rooms, dimensions, and annotations.
6. Provide grid and snapping functionality.
7. Provide zoom and pan.
8. Provide undo and redo.
9. Provide layer visibility and locking.
10. Allow plans to be saved and loaded as FloorPlan JSON.
11. Allow drawings to be exported to PNG and SVG.
12. Establish a clean architecture for future DXF/DWG interoperability.
13. Keep the drawing editor independent from CAD file-format conversion.

The most important architectural principle is:

```text
FloorPlan JSON
      |
      +----> Konva / React-Konva
      |          |
      |          +----> Interactive 2D Editor
      |
      +----> JSON Export
      |
      +----> SVG Export
      |
      +----> PNG Export
      |
      +----> DXF Export
      |
      +----> DWG Conversion Layer
```

---

# 3. Technology Stack

## Frontend

- React
- Vite
- TypeScript

## 2D Rendering

- Konva
- React-Konva

## State Management

- Zustand

## Storage

Version One can use:

- FloorPlan JSON files
- Browser localStorage for local persistence

A backend/database is not required for the core V1 editor.

## CAD Architecture

CAD import/export is isolated from the drawing engine.

This allows future integration with:

- DXF parsers/exporters
- DWG conversion services
- Backend CAD processing
- Database persistence

---

# 4. Core Architecture

The application follows a model-driven architecture.

The **FloorPlan JSON model is the source of truth**.

Konva is not the database and is not the permanent project format.

## High-Level Architecture

```text
                         React Application
                                |
                                v
                       FloorPlan JSON Model
                                |
               +----------------+----------------+
               |                                 |
               v                                 v
        React-Konva Renderer                Import / Export
               |                                 |
               v                    +------------+-------------+
        Interactive Canvas          |            |             |
                                    v            v             v
                                  JSON         SVG           CAD
                                                               |
                                                          DXF / DWG
```

## Why this architecture?

A house plan is architectural data, not merely a collection of canvas pixels.

For example:

```json
{
  "id": "wall-001",
  "type": "wall",
  "start": {
    "x": 0,
    "y": 0
  },
  "end": {
    "x": 4000,
    "y": 0
  },
  "thickness": 200
}
```

This object describes a 4000 mm wall.

The same object can then be:

- rendered by Konva
- exported to SVG
- converted to DXF
- converted to DWG
- saved to a database
- used by another renderer in the future

---

# 5. FloorPlan JSON Model

The general V1 model is:

```ts
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
```

## Wall

```ts
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
```

## Door

```ts
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
```

## Window

```ts
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
```

## Room

A V1 room is primarily a rectangular room object.

Typical properties include:

- room name
- position
- width
- height
- calculated area
- layer

## Dimension

A dimension stores its geometric references rather than only storing a text value.

For example:

```ts
interface Dimension {
  id: string;
  type: "dimension";

  start: Point;
  end: Point;

  offset: number;

  layerId: string;
}
```

The displayed value is calculated from the geometry.

---

# 6. Version One Features

## Drawing

- 2D drawing canvas
- CAD-style grid
- World coordinates
- Millimeter-based dimensions
- Wall drawing
- Door placement
- Window placement
- Rectangular rooms
- Text annotations
- Dimensions
- Measurement

## Navigation

- Zoom in
- Zoom out
- Zoom around cursor
- Pan
- Fit drawing to screen
- Reset view

## Editing

- Object selection
- Object movement
- Object deletion
- Wall thickness editing
- Door width editing
- Window width editing
- Room editing
- Text editing
- Dimension editing

## Precision

- Grid snapping
- Endpoint snapping
- Midpoint snapping
- Orthogonal drawing
- Accurate distance calculation
- Angle calculation

## Project Management

- New plan
- Save JSON
- Load JSON
- Local autosave
- Undo
- Redo

## Layers

Default V1 layers:

- Walls
- Doors
- Windows
- Rooms
- Dimensions
- Annotations
- Furniture

Layers can be:

- visible/hidden
- locked/unlocked

## Export

V1 export architecture supports:

- JSON
- PNG
- SVG
- DXF integration point
- DWG integration point/conversion layer

---

# 7. Getting Started

## Prerequisites

Install:

- Node.js
- npm

Verify:

```bash
node -v
npm -v
```

## Install dependencies

From the project directory:

```bash
npm install
```

The core drawing dependencies are:

```bash
npm install konva react-konva zustand
```

## Run development server

```bash
npm run dev
```

Open the URL shown by Vite in the browser.

Typical Vite development URL:

```text
http://localhost:5173
```

## Build for production

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

---

# 8. Application Interface

The application is divided into several areas.

```text
+-------------------------------------------------------------------+
| File | Edit | View | Draw | Tools | Export                        |
+-------------------------------------------------------------------+
| Select | Wall | Door | Window | Room | Dimension | Measure | Text |
+-------------+---------------------------------------+-------------+
|             |                                       |             |
| Tool /      |                                       | Properties  |
| Layers      |              Drawing Canvas            |             |
|             |                                       |             |
|             |                                       |             |
+-------------+---------------------------------------+-------------+
| X: 1000 mm | Y: 800 mm | Zoom: 100% | Snap ON | Units: mm       |
+-------------------------------------------------------------------+
```

## Main Areas

### Top menu

Provides:

- File operations
- Editing commands
- View commands
- Drawing tools
- Tools
- Export

### Drawing toolbar

Provides:

- Select
- Wall
- Door
- Window
- Room
- Dimension
- Measure
- Text

### Left panel

Provides:

- tools
- layers
- layer visibility
- layer locking

### Center canvas

Contains:

- grid
- floor plan
- dimensions
- annotations
- selection
- drawing previews

### Right properties panel

Displays properties of the selected object.

### Status bar

Displays:

- X coordinate
- Y coordinate
- zoom
- snapping state
- units

---

# 9. Working With the Drawing Canvas

The canvas uses a world-coordinate system.

The default internal unit is:

```text
millimeter (mm)
```

Example:

```text
4000 mm = 4 meters
```

The browser screen does not represent actual architectural dimensions.

Instead:

```text
World coordinate
      |
      v
Viewport transform
      |
      v
Screen coordinate
```

This allows the user to zoom in/out without changing the actual dimensions of the plan.

---

# 10. Creating a New House Plan

To create a new plan:

1. Select **File → New**.
2. Choose or confirm the project units.
3. The default unit is millimeters.
4. The drawing workspace opens with a grid.
5. Select the Wall tool.
6. Draw the external walls.
7. Add internal walls.
8. Add rooms.
9. Add doors.
10. Add windows.
11. Add dimensions.
12. Add annotations if required.
13. Save the project as FloorPlan JSON.

A basic plan can be created without entering every dimension manually because the application can calculate geometry from the drawing.

---

# 11. Drawing Walls

Walls are the main architectural primitive.

## Basic workflow

1. Select **Wall**.
2. Click the starting point.
3. Move the mouse.
4. A temporary wall preview is displayed.
5. Click the ending point.
6. The wall is added to the FloorPlan JSON.
7. Konva renders the updated wall.

Example:

```text
Start                         End
  +-----------------------------+
  |                             |
  |         4000 mm             |
  |                             |
```

## Wall properties

A wall can have:

- start X
- start Y
- end X
- end Y
- thickness
- length

Default thickness:

```text
200 mm
```

The length is calculated from the start and end points.

---

# 12. Adding Doors

Select the **Door** tool.

Place the door at the desired location.

A door contains:

- position
- width
- rotation
- swing direction

Default V1 width:

```text
900 mm
```

The visual representation contains:

- door leaf
- swing/opening arc

The door can be:

- moved
- edited
- deleted
- rotated
- resized

---

# 13. Adding Windows

Select the **Window** tool.

Place the window on the desired wall.

A window contains:

- position
- width
- rotation

Default V1 width:

```text
1200 mm
```

The window can be:

- moved
- edited
- deleted
- resized
- rotated

---

# 14. Creating Rooms

V1 supports basic rectangular rooms.

Select the **Room** tool.

Create the room and specify:

- position
- width
- height
- room name

Example:

```text
Living Room
5000 mm × 4000 mm
Area: 20.00 m²
```

Area is calculated automatically:

```text
Area = width × height
```

For example:

```text
5000 × 4000
= 20,000,000 mm²
= 20 m²
```

Room labels are displayed on the canvas.

---

# 15. Adding Dimensions

Use the **Dimension** tool.

Basic workflow:

1. Select Dimension.
2. Select the first point.
3. Select the second point.
4. Position the dimension offset.
5. The dimension is displayed.

Example:

```text
<---------------------------->
            4000 mm
```

Dimension values are calculated from actual world coordinates.

This means the dimension remains accurate when the geometry changes.

Supported V1 dimension types:

- horizontal
- vertical
- basic aligned dimensions where supported

---

# 16. Measuring a Plan

The Measure tool provides temporary measurements.

Workflow:

1. Select Measure.
2. Click the first point.
3. Move the cursor.
4. Click the second point.

The application displays:

```text
Distance: 4250 mm
Angle: 90°
```

Measurement is based on world coordinates.

The measurement tool is useful for checking:

- wall lengths
- room dimensions
- distances between objects
- approximate angles

---

# 17. Adding Text and Annotations

Use the **Text** tool.

Text can be used for:

- room names
- notes
- labels
- entrance labels
- architectural annotations

Example:

```text
MASTER BEDROOM
```

Properties include:

- text
- position
- font size
- rotation
- alignment

---

# 18. Selection and Editing

Use the **Select** tool.

Click any supported object.

The selected object is highlighted and its properties are shown in the Properties panel.

For example:

```text
WALL
----------------
Start X: 0 mm
Start Y: 0 mm
End X: 4000 mm
End Y: 0 mm
Length: 4000 mm
Thickness: 200 mm
```

Editing a property follows this flow:

```text
Properties Panel
       |
       v
FloorPlan JSON
       |
       v
React State
       |
       v
Konva Renderer
       |
       v
Updated Drawing
```

This keeps the application model and drawing synchronized.

---

# 19. Snapping and Orthogonal Drawing

Precision drafting requires snapping.

## Grid snapping

Example:

```text
397 mm
  |
  v
400 mm
```

The cursor snaps to the nearest configured grid point.

## Endpoint snapping

When drawing close to an existing wall endpoint, the cursor snaps to that endpoint.

This helps connect walls accurately.

## Midpoint snapping

The editor can snap to the midpoint of an existing wall.

## Orthogonal mode

Orthogonal mode constrains drawing to:

```text
0°
90°
180°
270°
```

This is useful for conventional rectangular house plans.

---

# 20. Layers

V1 provides a basic layer system.

Default layers:

```text
Walls
Doors
Windows
Rooms
Dimensions
Annotations
Furniture
```

Each layer supports:

### Visibility

Hide/show the entire layer.

### Lock

Prevent objects on a layer from being edited.

Example:

```text
Walls        👁 🔓
Doors        👁 🔓
Windows      👁 🔓
Dimensions   👁 🔒
Annotations  👁 🔓
```

A locked layer remains visible but cannot be modified.

---

# 21. Undo and Redo

The editor supports:

```text
Ctrl + Z
```

for undo and:

```text
Ctrl + Y
```

for redo.

History covers:

- drawing walls
- deleting objects
- moving objects
- changing dimensions
- changing properties
- adding/removing doors
- adding/removing windows
- room changes
- annotations

History is based on changes to the FloorPlan model.

---

# 22. View Mode and Design Mode

The application has two working modes.

## Design Mode

Used for drafting and editing.

Available:

- draw
- select
- move
- resize
- delete
- dimensions
- measurements
- annotations

## View Mode

Used for inspecting a completed plan.

Available:

- zoom
- pan
- inspect
- layer visibility
- measurement

Editing operations are disabled in View mode.

Switch using:

```text
[ Design ] [ View ]
```

---

# 23. Saving and Loading Plans

## JSON is the primary V1 project format

The application stores a floor plan as structured JSON.

Example:

```json
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
```

## Save

Use:

```text
File → Save
```

or:

```text
File → Save As JSON
```

The exported file contains the FloorPlan model.

## Load

Use:

```text
File → Open JSON
```

Select a previously exported FloorPlan JSON file.

The application:

```text
JSON File
   |
   v
Validate JSON
   |
   v
FloorPlan Model
   |
   v
Konva Renderer
   |
   v
Editable Drawing
```

This means a previously saved project can be opened and edited again.

## Local autosave

The current plan can also be stored in browser localStorage.

This protects against accidental refreshes during a working session.

---

# 24. Exporting Created Drawings

V1 provides multiple export paths.

## 24.1 JSON Export

JSON is the most important export for project persistence.

Use it when you want to:

- save the project
- reopen it later
- transfer the project to another application
- send the project to a backend
- preserve editable architectural data

JSON preserves the FloorPlan model.

---

## 24.2 PNG Export

PNG is intended for:

- quick sharing
- screenshots
- documentation
- presentations
- image previews

The PNG represents the visible drawing.

PNG is raster-based and should not be considered a CAD/editable format.

---

## 24.3 SVG Export

SVG is a vector export.

It is useful for:

- vector documentation
- web usage
- design previews
- further vector processing

The SVG should be generated from the FloorPlan model rather than simply taking a screenshot of the canvas.

---

## 24.4 DXF Export

DXF is intended for CAD interoperability.

The intended pipeline is:

```text
FloorPlan JSON
      |
      v
DXF Exporter
      |
      v
DXF
```

The DXF exporter maps application objects to CAD entities.

For example:

```text
Wall       → LINE / POLYLINE
Door       → LINE + ARC
Window     → LINE / POLYLINE
Dimension  → LINE + TEXT
Text       → TEXT
```

DXF support should be treated as a CAD export layer, not as the application's internal model.

---

## 24.5 DWG Export

DWG is not the primary project format.

The intended architecture is:

```text
FloorPlan JSON
      |
      v
DWG Conversion Layer
      |
      v
DWG
```

The application must never:

- rename a DXF file to `.dwg`
- rename an SVG file to `.dwg`
- generate a fake DWG file
- claim a file is DWG when it is not

If reliable DWG conversion is not available in the browser, the application should use a backend CAD conversion service in the future.

The future architecture can be:

```text
React Application
       |
       v
FloorPlan JSON
       |
       v
POST /api/cad/export/dwg
       |
       v
CAD Conversion Service
       |
       v
DWG File
```

---

# 25. Viewing and Editing Existing Plans

There are two important categories of existing plans.

## A. Existing plans created by this application

These are the easiest to support.

Workflow:

```text
Existing JSON
      |
      v
Open JSON
      |
      v
FloorPlan Model
      |
      v
Konva
      |
      v
View / Edit
```

A previously saved JSON plan remains fully editable because the architectural objects are preserved as structured data.

You can modify:

- walls
- doors
- windows
- rooms
- dimensions
- text
- layers

---

## B. Existing CAD plans

Existing DXF/DWG files require a CAD import/conversion pipeline.

The desired architecture is:

```text
DXF / DWG
    |
    v
CAD Importer / Converter
    |
    v
FloorPlan JSON
    |
    v
Konva
    |
    v
View + Edit
```

The important point is that imported CAD geometry must be converted into the application's FloorPlan model.

The editor should not directly depend on CAD file internals.

### V1 priority

The recommended priority is:

1. Full JSON import/export
2. SVG/PNG export
3. DXF interoperability
4. DWG interoperability through a conversion service

Full arbitrary DWG compatibility is outside the core browser editor responsibility.

---

# 26. Supported Plan Types in V1

Version One is intended primarily for **2D residential architectural floor plans**.

The application can support plans such as:

### Single-floor house

Example:

```text
+-------------------------------+
|        Living Room            |
|                               |
|---------+---------------------|
| Kitchen |      Bedroom        |
|         |                     |
|---------+---------------------|
| Bedroom | Bathroom | Bedroom  |
+-------------------------------+
```

### Apartment floor plan

Suitable for:

- 1 BHK
- 2 BHK
- 3 BHK
- larger simple apartments

### Small residential house

Can represent:

- living room
- dining room
- kitchen
- bedrooms
- bathrooms
- toilets
- utility areas
- corridors
- entrance
- balconies

### Basic office layout

The same 2D primitives can be used for:

- rooms
- partitions
- doors
- windows
- labels

### Simple commercial layout

The V1 engine can represent basic spaces such as:

- shops
- small offices
- reception areas
- storage areas

However, the application is primarily optimized for residential house plans.

---

# 27. What Can Be Designed in V1

The following types of designs can be created using the V1 primitives.

## Exterior Walls

Examples:

- rectangular houses
- L-shaped layouts
- simple irregular layouts
- extensions

## Interior Walls

Examples:

- bedroom partitions
- kitchen partitions
- bathroom partitions
- corridor walls
- utility partitions

## Rooms

Examples:

- Living Room
- Dining Room
- Kitchen
- Master Bedroom
- Bedroom
- Bathroom
- Toilet
- Study Room
- Pooja Room
- Utility Room
- Store Room
- Balcony
- Corridor

## Doors

Examples:

- Main entrance
- Bedroom doors
- Bathroom doors
- Kitchen doors
- Utility doors

## Windows

Examples:

- bedroom windows
- living room windows
- kitchen windows
- bathroom windows

## Dimensions

Examples:

```text
Room width: 4000 mm
Wall length: 5000 mm
Door width: 900 mm
Window width: 1200 mm
```

## Annotations

Examples:

```text
LIVING ROOM
MASTER BEDROOM
ENTRY
KITCHEN
UTILITY
```

---

# 28. What V1 Does Not Support

V1 is intentionally limited to 2D floor-plan drafting.

The following are not core V1 capabilities.

## 3D modeling

Not supported:

- 3D walls
- 3D furniture
- 3D roofs
- 3D elevations
- 3D walkthroughs

## Structural engineering

Not supported:

- column design calculations
- beam design
- footing design
- structural analysis
- reinforcement detailing

## MEP design

Not supported as a dedicated system:

- electrical circuits
- plumbing calculations
- HVAC
- detailed mechanical layouts

Basic 2D annotations can still represent these concepts, but there is no specialized MEP engine.

## Professional AutoCAD feature parity

V1 does not attempt to reproduce every AutoCAD feature.

Not included:

- full AutoCAD command system
- advanced block system
- XREF
- advanced hatch engine
- advanced linetypes
- advanced dimension styles
- dynamic blocks
- parametric constraints
- full CAD layer standards
- complete DWG compatibility

## Advanced geometry

Not a primary V1 goal:

- complex Boolean geometry
- splines
- advanced polylines
- complex arcs
- advanced curve editing
- advanced geometric constraints

---

# 29. CAD / DXF / DWG Strategy

The application deliberately separates CAD formats from the drawing model.

## Internal format

```text
FloorPlan JSON
```

## Rendering format

```text
Konva
```

## Exchange formats

```text
JSON
SVG
PNG
DXF
DWG
```

The architecture is:

```text
                     FloorPlan JSON
                           |
              +------------+------------+
              |            |            |
              v            v            v
            Konva        SVG/PNG       CAD
              |                         |
              v                    +----+----+
         Web Editor               DXF       DWG
```

This provides several advantages.

### Advantage 1: Renderer independence

Konva can be replaced later without changing the FloorPlan data model.

### Advantage 2: CAD independence

The application does not need to understand DWG while the user is editing.

### Advantage 3: Backend support

The same FloorPlan JSON can be sent to a backend.

### Advantage 4: Database support

The model can eventually be stored in PostgreSQL.

### Advantage 5: Future 3D support

The same model can later be extended to support 3D generation.

---

# 30. Recommended Workflow

A typical V1 workflow is:

## Step 1 — Start

Open the application.

## Step 2 — Create

Select:

```text
File → New
```

## Step 3 — Establish exterior walls

Use the Wall tool.

Draw the main boundary.

## Step 4 — Add internal walls

Create bedrooms, kitchen, bathrooms, corridors, etc.

## Step 5 — Add rooms

Add room labels and dimensions.

## Step 6 — Add doors

Place doors at required openings.

## Step 7 — Add windows

Place windows on external walls.

## Step 8 — Add dimensions

Dimension important walls and rooms.

## Step 9 — Measure

Use the Measure tool to verify geometry.

## Step 10 — Annotate

Add text such as:

```text
ENTRY
KITCHEN
MASTER BEDROOM
```

## Step 11 — Organize

Use layers to separate:

- walls
- doors
- windows
- dimensions
- annotations

## Step 12 — Save

Save the FloorPlan JSON.

## Step 13 — Export

Choose the appropriate output:

```text
JSON → editable project
SVG  → vector drawing
PNG  → image/share
DXF  → CAD interoperability
DWG  → CAD conversion workflow
```

---

# 31. Project Structure

Recommended project structure:

```text
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
```

---

# 32. Data Flow

## Drawing a wall

```text
User
 |
 | Click Wall
 v
Wall Tool
 |
 | mouse coordinates
 v
screenToWorld()
 |
 v
SnapManager
 |
 v
Wall object
 |
 v
FloorPlan JSON
 |
 v
Zustand
 |
 v
WallsLayer
 |
 v
Konva
 |
 v
Visible wall
```

## Editing a wall

```text
User selects wall
       |
       v
Properties Panel
       |
       v
Update FloorPlan
       |
       v
Zustand
       |
       v
Konva Renderer
       |
       v
Updated wall
```

## Exporting

```text
FloorPlan JSON
       |
       +------> JSON
       |
       +------> SVG
       |
       +------> PNG
       |
       +------> DXF
       |
       +------> DWG Conversion Service
```

---

# 33. Future Enhancements

After V1, the application can evolve toward a more complete architectural drafting system.

Potential V2/V3 features include:

## Advanced wall system

- wall joins
- automatic intersections
- wall cleanup
- wall offset
- wall splitting
- wall trimming

## Advanced rooms

- polygon rooms
- automatic room detection
- automatic area calculation from wall boundaries
- irregular room shapes

## Doors and windows

- door libraries
- window libraries
- different door types
- sliding doors
- double doors
- custom sizes
- wall-aware placement

## Furniture

Add reusable objects:

- bed
- sofa
- dining table
- chair
- toilet
- wash basin
- kitchen counter
- wardrobe

## Architectural symbols

- north arrow
- staircase
- columns
- sanitary fixtures
- electrical symbols

## Advanced dimensions

- chained dimensions
- baseline dimensions
- radial dimensions
- angular dimensions
- dimension styles

## CAD interoperability

- stronger DXF support
- DWG import
- DWG export
- CAD layer mapping
- blocks
- hatches
- linetypes

## Backend

Potential architecture:

```text
React + Konva
      |
      v
Node.js API
      |
      v
PostgreSQL
```

The FloorPlan JSON can be stored as:

- JSONB
- normalized relational tables
- both, depending on requirements

## Collaboration

Future support could include:

- multiple users
- project sharing
- permissions
- version history
- comments

---

# 34. POC Limitations

Version One intentionally focuses on the core 2D drafting workflow.

It should not be considered a replacement for professional architectural CAD software.

The most important limitations are:

1. 2D only.
2. Primarily residential floor plans.
3. Basic room geometry.
4. Basic door/window symbols.
5. Basic dimensions.
6. Basic layers.
7. Limited CAD entity support.
8. DWG interoperability depends on a reliable conversion layer.
9. Advanced AutoCAD features are outside V1.
10. Structural, MEP, and construction-document workflows are not specialized features.

The POC should prioritize:

```text
Correct geometry
+
Good editing experience
+
Reliable FloorPlan JSON
+
Clean export architecture
```

over attempting to implement every CAD feature.

---

# 35. Conclusion

Version One provides the foundation for a browser-based 2D house-plan drafting application.

The core concept is:

```text
                 FLOORPLAN JSON
                       |
             +---------+---------+
             |                   |
             v                   v
        React-Konva          Export Layer
             |                   |
             v              +----+----+----+
        2D CAD Editor       |    |    |    |
                            v    v    v    v
                           JSON SVG PNG DXF/DWG
```

The most important design decision is that **FloorPlan JSON remains the canonical representation of the drawing**.

Konva is responsible for:

- rendering
- mouse interaction
- selection
- visual editing
- zoom/pan

It is not responsible for defining the application's data model.

This makes the easier to extend and provides a clean path toward:

- DXF
- DWG
- backend storage
- PostgreSQL
- collaboration
- advanced architectural objects
- future 3D functionality

## V1 Summary

| Area                       | V1     |
| -------------------------- | ------ |
| 2D canvas                  | Yes    |
| Walls                      | Yes    |
| Doors                      | Yes    |
| Windows                    | Yes    |
| Rooms                      | Yes    |
| Dimensions                 | Yes    |
| Measurement                | Yes    |
| Text                       | Yes    |
| Grid                       | Yes    |
| Snap                       | Yes    |
| Orthogonal mode            | Yes    |
| Zoom/Pan                   | Yes    |
| Layers                     | Yes    |
| Undo/Redo                  | Yes    |
| JSON save/load             | Yes    |
| Local persistence          | Yes    |
| PNG export                 | Yes    |
| SVG export                 | Yes    |
| DXF architecture           | Yes    |
| DWG architecture           | Yes    |
| Full AutoCAD replacement   | No     |
| 3D                         | No     |
| Structural design          | No     |
| MEP design                 | No     |
| Advanced DWG compatibility | Future |
