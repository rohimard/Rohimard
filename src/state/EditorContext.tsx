import React, { createContext, useContext, useMemo, useReducer } from "react";
import * as History from "./HistoryManager";
import { buildStampedElements } from "../lib/strokeMath";
import type {
  BrushSettings,
  CanvasItem,
  EditorState,
  ImageDocument,
  StickerElement,
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
  items: [],
  redoStack: [],
  activeTool: "brush",
  settings: DEFAULT_SETTINGS,
};

type Action =
  | { type: "SET_DOCUMENT"; document: ImageDocument; keepItems?: boolean }
  | { type: "SET_TOOL"; tool: ToolId }
  | { type: "UPDATE_SETTINGS"; settings: Partial<BrushSettings> }
  | { type: "COMMIT_STROKE"; stroke: TextStroke }
  | { type: "ADD_STICKER"; sticker: StickerElement }
  | { type: "UPDATE_STICKER"; id: string; patch: Partial<StickerElement> }
  | { type: "REMOVE_STICKER"; id: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR_ALL" }
  | { type: "RESCALE_ITEMS"; scale: number };

function findLastBrushStroke(items: CanvasItem[]): { index: number; stroke: TextStroke } | null {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.kind === "stroke" && item.data.tool === "brush") {
      return { index: i, stroke: item.data };
    }
  }
  return null;
}

function rescaleItem(item: CanvasItem, scale: number): CanvasItem {
  if (item.kind === "sticker") {
    return {
      kind: "sticker",
      data: {
        ...item.data,
        x: item.data.x * scale,
        y: item.data.y * scale,
        baseSize: item.data.baseSize * scale,
      },
    };
  }
  return {
    kind: "stroke",
    data: {
      ...item.data,
      elements: item.data.elements.map((el) => ({
        ...el,
        x: el.x * scale,
        y: el.y * scale,
        fontSize: el.fontSize * scale,
      })),
      points: item.data.points?.map((p) => ({ ...p, x: p.x * scale, y: p.y * scale })),
    },
  };
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case "SET_DOCUMENT":
      return action.keepItems
        ? { ...state, document: action.document }
        : { ...state, document: action.document, items: [], redoStack: [] };
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

      const lastBrush = findLastBrushStroke(state.items);
      if (!lastBrush?.stroke.points || lastBrush.stroke.points.length < 2) {
        return { ...state, settings: mergedSettings };
      }

      const regenerated = buildStampedElements(lastBrush.stroke.points, mergedSettings, lastBrush.stroke.id);
      if (regenerated.length === 0) {
        return { ...state, settings: mergedSettings };
      }

      const items = [...state.items];
      items[lastBrush.index] = { kind: "stroke", data: { ...lastBrush.stroke, elements: regenerated } };
      return { ...state, settings: mergedSettings, items };
    }
    case "COMMIT_STROKE":
      return { ...state, ...History.pushItem(state, { kind: "stroke", data: action.stroke }) };
    case "ADD_STICKER":
      return { ...state, ...History.pushItem(state, { kind: "sticker", data: action.sticker }) };
    case "UPDATE_STICKER": {
      // Live drag/pinch/rotate updates — not its own undo step, just an
      // in-place edit of the sticker placed by an earlier ADD_STICKER.
      const items = state.items.map((item) =>
        item.kind === "sticker" && item.data.id === action.id
          ? { kind: "sticker" as const, data: { ...item.data, ...action.patch } }
          : item
      );
      return { ...state, items };
    }
    case "REMOVE_STICKER":
      return { ...state, items: state.items.filter((item) => !(item.kind === "sticker" && item.data.id === action.id)) };
    case "UNDO":
      return { ...state, ...History.undo(state) };
    case "REDO":
      return { ...state, ...History.redo(state) };
    case "CLEAR_ALL":
      return { ...state, ...History.clearAll(state) };
    case "RESCALE_ITEMS": {
      const { scale } = action;
      return {
        ...state,
        items: state.items.map((item) => rescaleItem(item, scale)),
        redoStack: state.redoStack.map((item) => rescaleItem(item, scale)),
      };
    }
    default:
      return state;
  }
}

interface EditorContextValue {
  state: EditorState;
  elements: TextElement[];
  stickers: StickerElement[];
  canUndo: boolean;
  canRedo: boolean;
  setDocument: (document: ImageDocument, keepItems?: boolean) => void;
  setTool: (tool: ToolId) => void;
  updateSettings: (settings: Partial<BrushSettings>) => void;
  commitStroke: (stroke: TextStroke) => void;
  addSticker: (sticker: StickerElement) => void;
  updateSticker: (id: string, patch: Partial<StickerElement>) => void;
  removeSticker: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  rescaleItems: (scale: number) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const elements = useMemo(
    () =>
      state.items.flatMap((item) => (item.kind === "stroke" ? item.data.elements : [])),
    [state.items]
  );

  const stickers = useMemo(
    () => state.items.flatMap((item) => (item.kind === "sticker" ? [item.data] : [])),
    [state.items]
  );

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      elements,
      stickers,
      canUndo: state.items.length > 0,
      canRedo: state.redoStack.length > 0,
      setDocument: (document, keepItems) => dispatch({ type: "SET_DOCUMENT", document, keepItems }),
      setTool: (tool) => dispatch({ type: "SET_TOOL", tool }),
      updateSettings: (settings) => dispatch({ type: "UPDATE_SETTINGS", settings }),
      commitStroke: (stroke) => dispatch({ type: "COMMIT_STROKE", stroke }),
      addSticker: (sticker) => dispatch({ type: "ADD_STICKER", sticker }),
      updateSticker: (id, patch) => dispatch({ type: "UPDATE_STICKER", id, patch }),
      removeSticker: (id) => dispatch({ type: "REMOVE_STICKER", id }),
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
      clearAll: () => dispatch({ type: "CLEAR_ALL" }),
      rescaleItems: (scale) => dispatch({ type: "RESCALE_ITEMS", scale }),
    }),
    [state, elements, stickers]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within an EditorProvider");
  return ctx;
}
