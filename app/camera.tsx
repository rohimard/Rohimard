import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import TextBrush from "../src/components/TextBrush";
import StickerLayer from "../src/components/StickerLayer";
import StickerPicker from "../src/components/StickerPicker";
import BrushSettingsPanel from "../src/components/BrushSettings";
import LiveVideoCamera, { type LiveVideoCameraHandle } from "../src/components/LiveVideoCamera";
import { TOOL_ITEMS, ACTIVE_COLOR, INACTIVE_COLOR } from "../src/components/BrushToolbar";
import { useEditor } from "../src/state/EditorContext";
import { fitCanvasSize, SCREEN_WIDTH, SCREEN_HEIGHT, EDITOR_CANVAS_MAX_HEIGHT } from "../src/lib/canvasSize";
import { addRecentProject } from "../src/lib/storage";
import { saveRecordedVideoToGallery } from "../src/state/ExportManager";
import { BRAND_FONT_BOLD } from "../src/lib/fonts";
import type { ToolId } from "../src/types";

type CaptureMode = "photo" | "video";

// Portrait photo aspect assumed for the live preview (matches the still
// photo's aspect ratio closely enough on both platforms — Android is told
// this explicitly via the `ratio` prop, iOS's standard photo capture is
// already close to 4:3). The exact captured size is read back after the
// shot and used to rescale the drawn strokes into the editor's own canvas.
const PREVIEW_MAX_HEIGHT = SCREEN_HEIGHT - 260;
const previewCanvasSize = fitCanvasSize(3, 4, SCREEN_WIDTH, PREVIEW_MAX_HEIGHT);
const DEFAULT_STICKER_SIZE = 100;
let stickerCounter = 0;

export default function CameraScreen() {
  const router = useRouter();
  const {
    state,
    stickers,
    setTool,
    updateSettings,
    addSticker,
    undo,
    canUndo,
    clearAll,
    rescaleItems,
    setDocument,
  } = useEditor();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [capturing, setCapturing] = useState(false);
  const [ready, setReady] = useState(false);
  const [stickerPickerVisible, setStickerPickerVisible] = useState(false);
  const [mode, setMode] = useState<CaptureMode>("photo");
  const [videoReady, setVideoReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const liveVideoRef = useRef<LiveVideoCameraHandle>(null);

  // Start every camera session with a clean canvas — strokes left over from
  // a previous editor session shouldn't silently appear on a new photo.
  useEffect(() => {
    clearAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Video mode's drawing/sticker rendering all happens inside the WebView —
  // keep it in sync with settings changed from the panel below.
  useEffect(() => {
    if (mode === "video" && videoReady) {
      liveVideoRef.current?.pushSettings(state.settings);
    }
  }, [mode, videoReady, state.settings]);

  useEffect(() => {
    setVideoReady(false);
  }, [mode]);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing || !ready) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (!photo) throw new Error("No se pudo capturar la foto");

      if (state.items.length > 0) {
        const editorCanvasSize = fitCanvasSize(
          photo.width,
          photo.height,
          SCREEN_WIDTH,
          EDITOR_CANVAS_MAX_HEIGHT
        );
        const scale = editorCanvasSize.width / previewCanvasSize.width;
        rescaleItems(scale);
      }

      await addRecentProject({ uri: photo.uri, width: photo.width, height: photo.height });
      setDocument({ uri: photo.uri, width: photo.width, height: photo.height }, true);
      router.replace({
        pathname: "/editor",
        params: { uri: photo.uri, width: String(photo.width), height: String(photo.height) },
      });
    } catch {
      Alert.alert("Error", "No se pudo tomar la foto.");
    } finally {
      setCapturing(false);
    }
  };

  const handleSelectTool = (tool: ToolId) => {
    setTool(tool);
    if (tool === "sticker") setStickerPickerVisible(true);
  };
  const handleClose = () => router.back();

  const handleFlip = () => {
    if (recording) return;
    const next = facing === "back" ? "front" : "back";
    setFacing(next);
    if (mode === "video") liveVideoRef.current?.switchCamera(next);
  };

  const handleSelectSticker = (uri: string) => {
    if (mode === "video") {
      liveVideoRef.current?.addSticker(uri);
      setStickerPickerVisible(false);
      return;
    }
    stickerCounter += 1;
    addSticker({
      id: `sticker-${Date.now()}-${stickerCounter}`,
      uri,
      x: previewCanvasSize.width / 2,
      y: previewCanvasSize.height / 2,
      scale: 1,
      rotation: 0,
      baseSize: DEFAULT_STICKER_SIZE,
      createdAt: Date.now(),
    });
    setStickerPickerVisible(false);
  };

  const handleToggleRecording = async () => {
    if (!liveVideoRef.current || savingVideo) return;
    if (!recording) {
      liveVideoRef.current.startRecording();
      setRecording(true);
      return;
    }
    setSavingVideo(true);
    try {
      const video = await liveVideoRef.current.stopRecording();
      setRecording(false);
      const result = await saveRecordedVideoToGallery(video);
      if (result.ok) {
        Alert.alert("Video guardado", "Se guardó en tu galería.");
      } else if (result.reason === "permission") {
        Alert.alert("Permiso necesario", "Activa el acceso a la galería para guardar el video.");
      } else {
        Alert.alert("Error", "No se pudo guardar el video.");
      }
    } catch {
      setRecording(false);
      Alert.alert("Error", "No se pudo grabar el video.");
    } finally {
      setSavingVideo(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={ACTIVE_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="camera-outline" size={40} color="#6B7280" />
          <Text style={styles.permissionText}>
            PhotoBrush necesita acceso a tu cámara para dibujar en vivo y tomar la foto.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Activar cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} hitSlop={12}>
            <Text style={styles.cancelText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const drawMode: "brush" | "tap" = state.activeTool === "text" ? "tap" : "brush";
  const drawingEnabled = ready && state.activeTool !== "sticker";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} hitSlop={12}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === "photo" && styles.modeButtonActive]}
            onPress={() => !recording && setMode("photo")}
          >
            <Text style={[styles.modeButtonText, mode === "photo" && styles.modeButtonTextActive]}>Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === "video" && styles.modeButtonActive]}
            onPress={() => !recording && setMode("video")}
          >
            <Text style={[styles.modeButtonText, mode === "video" && styles.modeButtonTextActive]}>Video</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleFlip} hitSlop={12} disabled={recording}>
          <Ionicons name="camera-reverse-outline" size={26} color={recording ? "#3A3A44" : "#fff"} />
        </TouchableOpacity>
      </View>

      <View style={styles.previewWrapper}>
        <View style={{ width: previewCanvasSize.width, height: previewCanvasSize.height }}>
          {mode === "photo" ? (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFillObject}
                facing={facing}
                ratio="4:3"
                onCameraReady={() => setReady(true)}
              />
              <TextBrush
                width={previewCanvasSize.width}
                height={previewCanvasSize.height}
                enabled={drawingEnabled}
                mode={drawMode}
              />
              <StickerLayer stickers={stickers} interactive={state.activeTool === "sticker"} />
            </>
          ) : (
            <LiveVideoCamera
              ref={liveVideoRef}
              width={previewCanvasSize.width}
              height={previewCanvasSize.height}
              initialSettings={state.settings}
              initialFacing={facing}
              onReady={() => setVideoReady(true)}
              onError={(message) => Alert.alert("Error", message)}
            />
          )}
          {!videoReady && mode === "video" && (
            <View style={styles.videoLoadingOverlay} pointerEvents="none">
              <ActivityIndicator color={ACTIVE_COLOR} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomPanel}>
        <TextInput
          style={styles.phraseInput}
          value={state.settings.phrase}
          onChangeText={(phrase) => updateSettings({ phrase })}
          placeholder="Escribe el texto para la brocha"
          placeholderTextColor="#6B7280"
        />

        {state.activeTool === "sticker" ? (
          <View style={styles.settingsPanel}>
            <View style={styles.stickerPanelRow}>
              <Text style={styles.stickerPanelHint}>
                Arrastrá, pellizcá o girá el sticker. Doble toque para borrarlo.
              </Text>
              <TouchableOpacity style={styles.addStickerButton} onPress={() => setStickerPickerVisible(true)}>
                <Ionicons name="add" size={18} color="#04121a" />
                <Text style={styles.addStickerButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          state.activeTool !== "brush" &&
          state.activeTool !== "text" && (
            <View style={styles.settingsPanel}>
              <BrushSettingsPanel
                activeTool={state.activeTool}
                settings={state.settings}
                onChange={updateSettings}
              />
            </View>
          )
        )}

        <View style={styles.toolRow}>
          {TOOL_ITEMS.map((item) => {
            const active = state.activeTool === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.toolButton, active && styles.toolButtonActive]}
                onPress={() => handleSelectTool(item.id)}
              >
                {item.renderIcon(active ? ACTIVE_COLOR : INACTIVE_COLOR)}
              </TouchableOpacity>
            );
          })}
          {mode === "photo" && (
            <>
              <View style={styles.toolDivider} />
              <TouchableOpacity style={styles.toolButton} onPress={undo} disabled={!canUndo}>
                <Ionicons name="arrow-undo-outline" size={20} color={canUndo ? INACTIVE_COLOR : "#3A3A44"} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolButton} onPress={clearAll} disabled={!canUndo}>
                <Ionicons name="trash-outline" size={20} color={canUndo ? INACTIVE_COLOR : "#3A3A44"} />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.shutterRow}>
          {mode === "photo" ? (
            <TouchableOpacity
              style={[styles.shutterButton, capturing && styles.shutterButtonBusy]}
              onPress={handleCapture}
              disabled={capturing || !ready}
            >
              {capturing ? <ActivityIndicator color="#0B0B0F" /> : <View style={styles.shutterInner} />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.shutterButton, savingVideo && styles.shutterButtonBusy]}
              onPress={handleToggleRecording}
              disabled={savingVideo || !videoReady}
            >
              {savingVideo ? (
                <ActivityIndicator color="#0B0B0F" />
              ) : (
                <View style={[styles.shutterInner, styles.shutterInnerVideo, recording && styles.shutterInnerRecording]} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <StickerPicker
        visible={stickerPickerVisible}
        onClose={() => setStickerPickerVisible(false)}
        onSelect={handleSelectSticker}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionText: { color: "#9CA3AF", fontSize: 15, textAlign: "center" },
  permissionButton: {
    backgroundColor: ACTIVE_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: { color: "#04121a", fontWeight: "700", fontSize: 15 },
  cancelText: { color: "#6B7280", fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontFamily: BRAND_FONT_BOLD },
  modeToggle: { flexDirection: "row", backgroundColor: "#1A1A22", borderRadius: 10, padding: 3, gap: 2 },
  modeButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  modeButtonActive: { backgroundColor: "#4CC9F0" },
  modeButtonText: { color: "#9CA3AF", fontSize: 13, fontWeight: "700" },
  modeButtonTextActive: { color: "#04121a" },
  previewWrapper: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11,11,15,0.6)",
  },
  bottomPanel: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 12 },
  phraseInput: {
    backgroundColor: "#1A1A22",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  settingsPanel: {
    backgroundColor: "#141419",
    borderRadius: 14,
    padding: 14,
  },
  stickerPanelRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stickerPanelHint: { flex: 1, color: "#9CA3AF", fontSize: 12.5, lineHeight: 17 },
  addStickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4CC9F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addStickerButtonText: { color: "#04121a", fontWeight: "700", fontSize: 13 },
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toolButtonActive: { backgroundColor: "#1A1A22" },
  toolDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: "#2A2A33",
    marginHorizontal: 4,
  },
  shutterRow: { alignItems: "center", paddingTop: 4 },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#2A2A33",
  },
  shutterButtonBusy: { opacity: 0.7 },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0B0B0F",
  },
  shutterInnerVideo: { backgroundColor: "#FF3B3B" },
  shutterInnerRecording: { borderRadius: 10, width: 32, height: 32 },
});
