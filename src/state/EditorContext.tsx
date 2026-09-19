import React, { createContext, useContext, useMemo, useReducer } from "react";
import * as History from "./HistoryManager";
import { buildStampedElements } from "../lib/strokeMath";
import type {
  BrushSettings,
  EditorState,
  ImageDocument,
  TextElement,
  TextStroke,
  ToolId,
} from "../types";

export const DEFAULT_SETTINGS: BrushSettings = {
  phrase: "TEXTO",
  color: "#FFFFFF",
  fontSize: 28,
  fontId: "system",
  spacing: 90,
  opacity: 1,
};

const initialState: EditorState = {
  document: null,
  strokes: [],
  redoStack: [],
  activeTool: "brush",
  settings: DEFAULT_SETTINGS,
};

type Action =
  | { type: "SET_DOCUMENT"; document: ImageDocument }
  | { type: "SET_TOOL"; tool: ToolId }
  | { type: "UPDATE_SETTINGS"; settings: Partial<BrushSettings> }
  | { type: "COMMIT_STROKE"; stroke: TextStroke }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR_ALL" };

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case "SET_DOCUMENT":
      return { ...state, document: action.document, strokes: [], redoStack: [] };
    case "SET_TOOL":
      return { ...state, activeTool: action.tool };
    case "UPDATE_SETTINGS": {
      const mergedSettings = { ...state.settings, ...action.settings };

      // A phrase-only edit (typing in the text field) shouldn't rewrite
      // text that's already on the canvas — only a style change (size,
      // spacing, color, font, opacity) should live-edit the last stroke.
      const touchesStyle = Object.keys(action.settings).some((key) => key !== "phrase");
      if (!touchesStyle) {
        return { ...state, settings: mergedSettings };
      }

      let lastBrushIndex = -1;
      for (let i = state.strokes.length - 1; i >= 0; i--) {
        if (state.strokes[i].tool === "brush") {
          lastBrushIndex = i;
          break;
        }
      }
      const lastBrushStroke = lastBrushIndex >= 0 ? state.strokes[lastBrushIndex] : undefined;
      if (!lastBrushStroke?.points || lastBrushStroke.points.length < 2) {
        return { ...state, settings: mergedSettings };
      }

      const regenerated = buildStampedElements(lastBrushStroke.points, mergedSettings, lastBrushStroke.id);
      if (regenerated.length === 0) {
        return { ...state, settings: mergedSettings };
      }

      const strokes = [...state.strokes];
      strokes[lastBrushIndex] = { ...lastBrushStroke, elements: regenerated };
      return { ...state, settings: mergedSettings, strokes };
    }
    case "COMMIT_STROKE":
      return { ...state, ...History.pushStroke(state, action.stroke) };
    case "UNDO":
      return { ...state, ...History.undo(state) };
    case "REDO":
      return { ...state, ...History.redo(state) };
    case "CLEAR_ALL":
      return { ...state, ...History.clearAll(state) };
    default:
      return state;
  }
}

interface EditorContextValue {
  state: EditorState;
  elements: TextElement[];
  canUndo: boolean;
  canRedo: boolean;
  setDocument: (document: ImageDocument) => void;
  setTool: (tool: ToolId) => void;
  updateSettings: (settings: Partial<BrushSettings>) => void;
  commitStroke: (stroke: TextStroke) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const elements = useMemo(
    () => state.strokes.flatMap((stroke) => stroke.elements),
    [state.strokes]
  );

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      elements,
      canUndo: state.strokes.length > 0,
      canRedo: state.redoStack.length > 0,
      setDocument: (document) => dispatch({ type: "SET_DOCUMENT", document }),
      setTool: (tool) => dispatch({ type: "SET_TOOL", tool }),
      updateSettings: (settings) => dispatch({ type: "UPDATE_SETTINGS", settings }),
      commitStroke: (stroke) => dispatch({ type: "COMMIT_STROKE", stroke }),
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
      clearAll: () => dispatch({ type: "CLEAR_ALL" }),
    }),
    [state, elements]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within an EditorProvider");
  return ctx;
}
