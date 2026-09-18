import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ImageCanvas from "../src/components/ImageCanvas";
import BrushToolbar from "../src/components/BrushToolbar";
import BrushSettingsPanel from "../src/components/BrushSettings";
import ExportCanvas from "../src/components/ExportCanvas";
import { useEditor } from "../src/state/EditorContext";
import { exportToGallery } from "../src/state/ExportManager";
import type { ToolId } from "../src/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MAX_CANVAS_HEIGHT = Dimensions.get("window").height * 0.52;

export default function EditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri: string; width: string; height: string }>();
  const {
    state,
    elements,
    canUndo,
    canRedo,
    setDocument,
    setTool,
    updateSettings,
    undo,
    redo,
    clearAll,
  } = useEditor();
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<View>(null);

  const nativeWidth = Number(params.width) || 1;
  const nativeHeight = Number(params.height) || 1;

  // Base (unzoomed) display size that preserves the photo's aspect ratio.
  const canvasSize = useMemo(() => {
    const scaledHeight = (nativeHeight / nativeWidth) * SCREEN_WIDTH;
    if (scaledHeight <= MAX_CANVAS_HEIGHT) {
      return { width: SCREEN_WIDTH, height: scaledHeight };
    }
    return { width: (nativeWidth / nativeHeight) * MAX_CANVAS_HEIGHT, height: MAX_CANVAS_HEIGHT };
  }, [nativeWidth, nativeHeight]);

  useEffect(() => {
    if (params.uri) {
      setDocument({ uri: params.uri, width: nativeWidth, height: nativeHeight });
    }
    // Only re-run when a genuinely different photo is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.uri]);

  const drawingEnabled = state.activeTool === "brush" || state.activeTool === "text";
  const drawMode: "brush" | "tap" = state.activeTool === "text" ? "tap" : "brush";

  const handleSelectTool = (tool: ToolId) => setTool(tool);

  const handleClear = () => {
    if (!canUndo) return;
    Alert.alert("Borrar todo", "Esto elimina todos los trazos de texto. ¿Continuar?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Borrar", style: "destructive", onPress: clearAll },
    ]);
  };

  const handleExport = async () => {
    if (!state.document || exporting) return;
    setExporting(true);
    const result = await exportToGallery(exportRef, {
      width: state.document.width,
      height: state.document.height,
    });
    setExporting(false);
    if (result.ok) {
      Alert.alert("Guardado", "La foto se guardó en tu galería.");
    } else if (result.reason === "permission") {
      Alert.alert("Permiso necesario", "Activa el acceso a la galería para guardar la foto.");
    } else {
      Alert.alert("Error", "No se pudo exportar la foto.");
    }
  };

  if (!state.document) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Cargando imagen…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PhotoBrush</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.canvasWrapper}>
        <ImageCanvas
          document={state.document}
          baseWidth={canvasSize.width}
          baseHeight={canvasSize.height}
          drawingEnabled={drawingEnabled}
          drawMode={drawMode}
        />
      </View>

      {/* Always-unzoomed off-screen snapshot used only for Exportar (see ExportManager). */}
      <ExportCanvas
        ref={exportRef}
        document={state.document}
        width={canvasSize.width}
        height={canvasSize.height}
        elements={elements}
      />

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

        <BrushToolbar
          activeTool={state.activeTool}
          onSelectTool={handleSelectTool}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onClear={handleClear}
          onExport={handleExport}
          exporting={exporting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#9CA3AF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerSpacer: { width: 26 },
  canvasWrapper: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
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
});
