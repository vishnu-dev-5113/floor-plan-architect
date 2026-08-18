import { createFileRoute } from "@tanstack/react-router";
import { EditorShell } from "@/components/editor/EditorShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlanForge — 2D House Plan & CAD Floor Plan Editor" },
      {
        name: "description",
        content:
          "Draft walls, doors, windows, rooms and dimensions on a millimetre-accurate CAD grid, then export to JSON, SVG, PNG or DXF.",
      },
      { property: "og:title", content: "PlanForge — 2D House Plan & CAD Floor Plan Editor" },
      {
        property: "og:description",
        content:
          "A browser-based CAD-style floor plan editor with snapping, layers, undo/redo and multi-format export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorShell,
});
