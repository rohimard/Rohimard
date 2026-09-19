import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { buildLiveRecorderHtml, buildLiveRecorderUri } from "../lib/liveVideoRecorder";
import type { BrushSettings } from "../types";
import type { RecordedVideo } from "./VideoExportWebView";

export type LiveVideoCameraHandle = {
  addSticker: (uri: string) => void;
  switchCamera: (facing: "front" | "back") => void;
  pushSettings: (settings: BrushSettings) => void;
  startRecording: () => void;
  /** Resolves with the recorded video once the WebView finishes encoding it. */
  stopRecording: () => Promise<RecordedVideo>;
};

type Props = {
  width: number;
  height: number;
  initialSettings: BrushSettings;
  initialFacing: "front" | "back";
  onReady?: () => void;
  onError?: (message: string) => void;
};

/**
 * The live "video mode" camera: a hidden-in-plain-sight WebView is the
 * actual camera + drawing surface (getUserMedia + canvas + MediaRecorder —
 * see lib/liveVideoRecorder), so the Text Brush effect and stickers are
 * genuinely baked into the recording as it happens, not composited after
 * the fact. React Native only sends commands in and receives the finished
 * video back out.
 */
const LiveVideoCamera = forwardRef<LiveVideoCameraHandle, Props>(function LiveVideoCamera(
  { width, height, initialSettings, initialFacing, onReady, onError },
  ref
) {
  const webviewRef = useRef<WebView>(null);
  const stopResolveRef = useRef<{ resolve: (v: RecordedVideo) => void; reject: (e: Error) => void } | null>(null);
  // Android loads the recorder from a real https://appassets.androidplatform.net
  // origin (served from a static asset via a patched react-native-webview) so
  // getUserMedia() sees a genuine secure context — loadDataWithBaseURL's
  // spoofed https baseUrl isn't reliably recognized as one on-device. iOS
  // keeps the inline-HTML approach, which doesn't have this issue.
  const [source] = useState(() =>
    Platform.OS === "android"
      ? { uri: buildLiveRecorderUri(initialSettings, initialFacing, { width, height }) }
      : { html: buildLiveRecorderHtml(initialSettings, initialFacing, { width, height }), baseUrl: "https://localhost" }
  );

  const send = (msg: Record<string, unknown>) => {
    webviewRef.current?.postMessage(JSON.stringify(msg));
  };

  useImperativeHandle(ref, () => ({
    addSticker: (uri) => send({ type: "addSticker", id: `s-${Date.now()}`, uri }),
    switchCamera: (facing) => send({ type: "switchCamera", facing }),
    pushSettings: (settings) => send({ type: "settings", settings }),
    startRecording: () => send({ type: "start" }),
    stopRecording: () =>
      new Promise<RecordedVideo>((resolve, reject) => {
        stopResolveRef.current = { resolve, reject };
        send({ type: "stop" });
      }),
  }));

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "ready") {
        onReady?.();
      } else if (data.type === "error") {
        onError?.(data.message || "Error de cámara");
      } else if (data.type === "recording-stopped") {
        stopResolveRef.current?.resolve({ base64: data.base64, mimeType: data.mimeType });
        stopResolveRef.current = null;
      }
    } catch {
      // Ignore malformed messages.
    }
  };

  return (
    <WebView
      ref={webviewRef}
      originWhitelist={["*"]}
      source={source}
      onMessage={handleMessage}
      style={[styles.webview, { width, height }]}
      javaScriptEnabled
      domStorageEnabled
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback
      mediaCapturePermissionGrantType="grant"
      onError={() => onError?.("La cámara en vivo no pudo cargar")}
    />
  );
});

export default LiveVideoCamera;

const styles = StyleSheet.create({
  webview: { backgroundColor: "#000" },
});
