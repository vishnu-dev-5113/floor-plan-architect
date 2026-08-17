import type { FloorPlan } from "@/domain/types";

export interface History {
  past: FloorPlan[];
  future: FloorPlan[];
}

export const MAX_HISTORY = 100;

export const emptyHistory = (): History => ({ past: [], future: [] });

export function pushHistory(history: History, snapshot: FloorPlan): History {
  const past = [...history.past, snapshot];
  if (past.length > MAX_HISTORY) past.shift();
  return { past, future: [] };
}

export function undo(history: History, current: FloorPlan) {
  if (history.past.length === 0) return null;
  const past = [...history.past];
  const previous = past.pop()!;
  return {
    plan: previous,
    history: { past, future: [current, ...history.future].slice(0, MAX_HISTORY) },
  };
}

export function redo(history: History, current: FloorPlan) {
  if (history.future.length === 0) return null;
  const [next, ...rest] = history.future;
  return {
    plan: next,
    history: { past: [...history.past, current].slice(-MAX_HISTORY), future: rest },
  };
}