import React, { createContext, useContext, useMemo, useReducer } from "react";
import * as History from "./HistoryManager";
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
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
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
