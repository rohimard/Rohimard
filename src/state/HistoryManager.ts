import type { TextStroke } from "../types";

export interface HistoryState {
  strokes: TextStroke[];
  redoStack: TextStroke[];
}

/** Commits a completed stroke (a full brush drag or a single tap placement) as one undo step. */
export function pushStroke(state: HistoryState, stroke: TextStroke): HistoryState {
  return { strokes: [...state.strokes, stroke], redoStack: [] };
}

export function undo(state: HistoryState): HistoryState {
  if (state.strokes.length === 0) return state;
  const stroke = state.strokes[state.strokes.length - 1];
  return {
    strokes: state.strokes.slice(0, -1),
    redoStack: [...state.redoStack, stroke],
  };
}

export function redo(state: HistoryState): HistoryState {
  if (state.redoStack.length === 0) return state;
  const stroke = state.redoStack[state.redoStack.length - 1];
  return {
    strokes: [...state.strokes, stroke],
    redoStack: state.redoStack.slice(0, -1),
  };
}

export function clearAll(state: HistoryState): HistoryState {
  if (state.strokes.length === 0) return state;
  return { strokes: [], redoStack: [] };
}
