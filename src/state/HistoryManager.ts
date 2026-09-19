import type { CanvasItem } from "../types";

export interface HistoryState {
  items: CanvasItem[];
  redoStack: CanvasItem[];
}

/** Commits a completed action (a stroke or a placed sticker) as one undo step. */
export function pushItem(state: HistoryState, item: CanvasItem): HistoryState {
  return { items: [...state.items, item], redoStack: [] };
}

export function undo(state: HistoryState): HistoryState {
  if (state.items.length === 0) return state;
  const item = state.items[state.items.length - 1];
  return {
    items: state.items.slice(0, -1),
    redoStack: [...state.redoStack, item],
  };
}

export function redo(state: HistoryState): HistoryState {
  if (state.redoStack.length === 0) return state;
  const item = state.redoStack[state.redoStack.length - 1];
  return {
    items: [...state.items, item],
    redoStack: state.redoStack.slice(0, -1),
  };
}

export function clearAll(state: HistoryState): HistoryState {
  if (state.items.length === 0) return state;
  return { items: [], redoStack: [] };
}
