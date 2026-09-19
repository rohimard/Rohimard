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
import BrushSettingsPanel from "../src/components/BrushSettings";
import { TOOL_ITEMS, ACTIVE_COLOR, INACTIVE_COLOR } from "../src/components/BrushToolbar";
import { useEditor } from "../src/state/EditorContext";
import { fitCanvasSize, SCREEN_WIDTH, SCREEN_HEIGHT, EDITOR_CANVAS_MAX_HEIGHT } from "../src/lib/canvasSize";
import { addRecentProject } from "../src/lib/storage";
import { BRAND_FONT_BOLD } from "../src/lib/fonts";
import type { ToolId } from "../src/types";

// Portrait photo aspect assumed for the live preview (matches the still
// photo's aspect ratio closely enough on both platforms — Android is told
// this explicitly via the `ratio` prop, iOS's standard photo capture is
// already close to 4:3). The exact captured size is read back after the
// shot and used to rescale the drawn strokes into the editor's own canvas.
const PREVIEW_MAX_HEIGHT = SCREEN_HEIGHT - 260;
const previewCanvasSize = fitCanvasSize(3, 4, SCREEN_WIDTH, PREVIEW_MAX_HEIGHT);

export default function CameraScreen() {
  const router = useRouter();
  const { state, setTool, updateSettings, undo, canUndo, clearAll, rescaleStrokes, setDocument } = useEditor();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [capturing, setCapturing] = useState(false);
  const [ready, setReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Start every camera session with a clean canvas — strokes left over from
  // a previous editor session shouldn't silently appear on a new photo.
  useEffect(() => {
    clearAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing || !ready) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (!photo) throw new Error("No se pudo capturar la foto");

      if (state.strokes.length > 0) {
        const editorCanvasSize = fitCanvasSize(
          photo.width,
          photo.height,
          SCREEN_WIDTH,
          EDITOR_CANVAS_MAX_HEIGHT
        );
        const scale = editorCanvasSize.width / previewCanvasSize.width;
        rescaleStrokes(scale);
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

  const handleSelectTool = (tool: ToolId) => setTool(tool);
  const handleClose = () => router.back();
  const handleFlip = () => setFacing((f) => (f === "back" ? "front" : "back"));

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

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} hitSlop={12}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cámara</Text>
        <TouchableOpacity onPress={handleFlip} hitSlop={12}>
          <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.previewWrapper}>
        <View style={{ width: previewCanvasSize.width, height: previewCanvasSize.height }}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            ratio="4:3"
            onCameraReady={() => setReady(true)}
          />
          <TextBrush width={previewCanvasSize.width} height={previewCanvasSize.height} enabled={ready} mode={drawMode} />
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

        {state.activeTool !== "brush" && state.activeTool !== "text" && (
          <View style={styles.settingsPanel}>
            <BrushSettingsPanel
              activeTool={state.activeTool}
              settings={state.settings}
              onChange={updateSettings}
            />
          </View>
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
          <View style={styles.toolDivider} />
          <TouchableOpacity style={styles.toolButton} onPress={undo} disabled={!canUndo}>
            <Ionicons name="arrow-undo-outline" size={20} color={canUndo ? INACTIVE_COLOR : "#3A3A44"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={clearAll} disabled={!canUndo}>
            <Ionicons name="trash-outline" size={20} color={canUndo ? INACTIVE_COLOR : "#3A3A44"} />
          </TouchableOpacity>
        </View>

        <View style={styles.shutterRow}>
          <TouchableOpacity
            style={[styles.shutterButton, capturing && styles.shutterButtonBusy]}
            onPress={handleCapture}
            disabled={capturing || !ready}
          >
            {capturing ? <ActivityIndicator color="#0B0B0F" /> : <View style={styles.shutterInner} />}
          </TouchableOpacity>
        </View>
      </View>
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
  previewWrapper: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
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
});
