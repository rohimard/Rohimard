import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { buildLiveRecorderHtml } from "../lib/liveVideoRecorder";
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
  const [html] = useState(() => buildLiveRecorderHtml(initialSettings, initialFacing, { width, height }));

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
      // Inline HTML has no real origin, and Android WebView treats that as
      // insecure — which strips `navigator.mediaDevices` entirely (getUserMedia
      // undefined) regardless of granted permissions. A fake https:// baseUrl
      // gives it a secure origin without actually navigating anywhere.
      source={{ html, baseUrl: "https://localhost" }}
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
