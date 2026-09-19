import type { RefObject } from "react";
import type { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import type { RecordedVideo } from "../components/VideoExportWebView";

export type ExportResult =
  | { ok: true }
  | { ok: false; reason: "permission" | "capture" | "save" };

/**
 * Captures the (always-unzoomed) export snapshot view and saves it to the
 * device gallery. `targetSize` should be the original photo's native pixel
 * dimensions — react-native-view-shot resizes its raster output to exactly
 * that size regardless of the on-screen view's display size, so the export
 * keeps the source photo's resolution whenever the platform allows it.
 */
export async function exportToGallery(
  viewRef: RefObject<View>,
  targetSize: { width: number; height: number }
): Promise<ExportResult> {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) return { ok: false, reason: "permission" };

    if (!viewRef.current) return { ok: false, reason: "capture" };
    const uri = await captureRef(viewRef, {
      width: Math.round(targetSize.width),
      height: Math.round(targetSize.height),
      format: "jpg",
      quality: 0.95,
    });
    if (!uri) return { ok: false, reason: "capture" };

    await MediaLibrary.saveToLibraryAsync(uri);
    return { ok: true };
  } catch {
    return { ok: false, reason: "save" };
  }
}

/**
 * Writes a base64-encoded recording (see VideoExportWebView) to a temp file
 * and saves it to the device gallery as a video.
 */
export async function saveRecordedVideoToGallery(video: RecordedVideo): Promise<ExportResult> {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) return { ok: false, reason: "permission" };

    const extension = video.mimeType.includes("webm") ? "webm" : "mp4";
    const fileUri = `${FileSystem.cacheDirectory}photobrush-brush-${Date.now()}.${extension}`;
    await FileSystem.writeAsStringAsync(fileUri, video.base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await MediaLibrary.saveToLibraryAsync(fileUri);
    return { ok: true };
  } catch {
    return { ok: false, reason: "save" };
  }
}
