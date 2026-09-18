// Core domain types for the PhotoBrush editor.
// Kept independent of any rendering library so the same shapes can drive
// SVG today and a different renderer later without touching state logic.

export type ToolId =
  | "text"
  | "brush"
  | "color"
  | "size"
  | "font"
  | "spacing"
  | "opacity";

export type FontId =
  | "system"
  | "poppins"
  | "bebasNeue"
  | "pacifico"
  | "anton"
  | "caveat";

export interface FontOption {
  id: FontId;
  label: string;
  // Actual RN fontFamily name once expo-font has loaded it (undefined = use
  // the platform default while the custom font is still loading).
  fontFamily: string | undefined;
}

/** Settings applied to whatever the user draws next (brush stroke or a single tap-placed text). */
export interface BrushSettings {
  phrase: string;
  color: string;
  fontSize: number;
  fontId: FontId;
  /** Distance in px between the center of consecutive stamped text instances along a brush stroke. */
  spacing: number;
  /** 0 (invisible) - 1 (opaque). */
  opacity: number;
}

/** One stamped/placed instance of text on the canvas — the atomic drawable unit. */
export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  /** Rotation in degrees, following the local direction of the stroke at this point. */
  rotation: number;
  color: string;
  fontSize: number;
  fontId: FontId;
  opacity: number;
  /**
   * Milliseconds since the stroke started, at the moment this stamp appeared
   * while the user was drawing. 0 for tap-placed ("Texto") elements. Lets a
   * brush stroke be replayed at the exact cadence it was drawn — the
   * MotionBrush prototype's core mechanic (see StrokeReplay).
   */
  timeMs: number;
}

export type StrokeTool = "text" | "brush";

/**
 * One completed user operation: either a single tap placement (tool "text",
 * one element) or a full Text Brush drag (tool "brush", many stamped
 * elements). This is the unit Undo/Redo operates on.
 */
export interface TextStroke {
  id: string;
  tool: StrokeTool;
  elements: TextElement[];
  createdAt: number;
}

export interface ImageDocument {
  uri: string;
  /** Native pixel dimensions of the original photo, used to export at full resolution. */
  width: number;
  height: number;
}

export interface EditorState {
  document: ImageDocument | null;
  strokes: TextStroke[];
  redoStack: TextStroke[];
  activeTool: ToolId;
  settings: BrushSettings;
}

export interface RecentProject {
  id: string;
  uri: string;
  width: number;
  height: number;
  updatedAt: number;
}
