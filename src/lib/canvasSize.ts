import { Dimensions } from "react-native";

/** Shared across every screen that shows a document, so their canvas math never drifts apart. */
export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const EDITOR_CANVAS_MAX_HEIGHT = SCREEN_HEIGHT * 0.52;

/**
 * Fits a native width/height into a maxWidth x maxHeight box, preserving
 * aspect ratio — the same "base (unzoomed) display size" calculation used by
 * every screen that shows a document and lets Text Brush draw on it.
 */
export function fitCanvasSize(
  nativeWidth: number,
  nativeHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const scaledHeight = (nativeHeight / nativeWidth) * maxWidth;
  if (scaledHeight <= maxHeight) {
    return { width: maxWidth, height: scaledHeight };
  }
  return { width: (nativeWidth / nativeHeight) * maxHeight, height: maxHeight };
}
