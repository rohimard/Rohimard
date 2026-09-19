import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { buildRecorderHtml, CHROMA_GREEN } from "../lib/videoExport";
import type { TextStroke } from "../types";

export type RecordedVideo = { base64: string; mimeType: string };

export type VideoExportHandle = {
  /** Records the stroke's animation over a chroma background; resolves with the recorded video. */
  recordStroke: (
    stroke: TextStroke,
    canvasSize: { width: number; height: number },
    scale?: number
  ) => Promise<RecordedVideo>;
};

type PendingRecording = {
  resolve: (video: RecordedVideo) => void;
  reject: (error: Error) => void;
};

/**
 * A hidden WebView that does the actual video recording: the browser engine
 * draws the stroke on a <canvas> over a chroma-key background and records it
 * with its own MediaRecorder — no native video library involved. Mounted
 * off-screen (not zero-size) so the canvas gets a real layout/backing store.
 */
const VideoExportWebView = forwardRef<VideoExportHandle>(function VideoExportWebView(_props, ref) {
    const [job, setJob] = useState<{ html: string; width: number; height: number } | null>(null);
    const pendingRef = useRef<PendingRecording | null>(null);

    useImperativeHandle(ref, () => ({
      recordStroke: (stroke, canvasSize, scale = 1) => {
        return new Promise<RecordedVideo>((resolve, reject) => {
          if (pendingRef.current) {
            reject(new Error("Ya hay una grabación en curso."));
            return;
          }
          pendingRef.current = { resolve, reject };
          setJob({
            html: buildRecorderHtml(stroke, canvasSize, CHROMA_GREEN, scale),
            width: canvasSize.width * scale,
            height: canvasSize.height * scale,
          });
        });
      },
    }));

    const finish = (result: { ok: true; video: RecordedVideo } | { ok: false; error: Error }) => {
      const pending = pendingRef.current;
      pendingRef.current = null;
      setJob(null);
      if (!pending) return;
      if (result.ok) pending.resolve(result.video);
      else pending.reject(result.error);
    };

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "done") {
          finish({ ok: true, video: { base64: data.base64, mimeType: data.mimeType } });
        } else if (data.type === "error") {
          finish({ ok: false, error: new Error(data.message || "Error grabando el video") });
        }
      } catch {
        finish({ ok: false, error: new Error("Respuesta inválida del grabador") });
      }
    };

    if (!job) return null;

    return (
      <View style={[styles.offscreen, { width: job.width, height: job.height }]} pointerEvents="none">
        <WebView
          originWhitelist={["*"]}
          source={{ html: job.html }}
          onMessage={handleMessage}
          onError={() => finish({ ok: false, error: new Error("El grabador no pudo cargar") })}
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
        />
      </View>
    );
  }
);

export default VideoExportWebView;

const styles = StyleSheet.create({
  offscreen: {
    position: "absolute",
    top: 0,
    left: -100000,
  },
});
