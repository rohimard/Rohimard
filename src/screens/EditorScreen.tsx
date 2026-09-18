import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import TextBrushCanvas, {
  TextBrushCanvasHandle,
} from "../components/TextBrushCanvas";

type Props = {
  imageUri: string;
  onBack: () => void;
};

const COLORS = ["#FFFFFF", "#000000", "#FF3B6F", "#FFD23F", "#4CC9F0", "#7C3AED"];
const SCREEN_WIDTH = Dimensions.get("window").width;
const MAX_CANVAS_HEIGHT = Dimensions.get("window").height * 0.6;

export default function EditorScreen({ imageUri, onBack }: Props) {
  const [canvasSize, setCanvasSize] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  });
  const [phrase, setPhrase] = useState("Happy Birthday 🎂");
  const [color, setColor] = useState(COLORS[0]);
  const [fontSize, setFontSize] = useState(22);
  const canvasRef = useRef<TextBrushCanvasHandle>(null);
  const shotRef = useRef<ViewShot>(null);

  useEffect(() => {
    Image.getSize(
      imageUri,
      (w, h) => {
        const displayWidth = SCREEN_WIDTH;
        const scaledHeight = (h / w) * displayWidth;
        const displayHeight = Math.min(scaledHeight, MAX_CANVAS_HEIGHT);
        const finalWidth =
          scaledHeight > MAX_CANVAS_HEIGHT
            ? (w / h) * MAX_CANVAS_HEIGHT
            : displayWidth;
        setCanvasSize({ width: finalWidth, height: displayHeight });
      },
      () => {}
    );
  }, [imageUri]);

  const handleSave = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permiso necesario",
          "Activa el acceso a la galería para guardar la foto."
        );
        return;
      }
      const uri = await shotRef.current?.capture?.();
      if (!uri) return;
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Guardado", "La foto se guardó en tu galería.");
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la foto.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.headerAction}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PhotoBrush</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.headerAction, styles.headerSave]}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasWrapper}>
        <ViewShot ref={shotRef} options={{ format: "jpg", quality: 0.95 }}>
          <View style={{ width: canvasSize.width, height: canvasSize.height }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: canvasSize.width, height: canvasSize.height }}
              resizeMode="cover"
            />
            <TextBrushCanvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              phrase={phrase}
              color={color}
              fontSize={fontSize}
            />
          </View>
        </ViewShot>
      </View>

      <View style={styles.toolbar}>
        <TextInput
          style={styles.input}
          value={phrase}
          onChangeText={setPhrase}
          placeholder="Escribe el texto para la brocha"
          placeholderTextColor="#6B7280"
        />

        <View style={styles.row}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.colorRow}
          >
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  color === c && styles.swatchSelected,
                ]}
              />
            ))}
          </ScrollView>

          <View style={styles.fontControls}>
            <TouchableOpacity
              style={styles.fontButton}
              onPress={() => setFontSize((s) => Math.max(12, s - 2))}
            >
              <Text style={styles.fontButtonText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fontButton}
              onPress={() => setFontSize((s) => Math.min(48, s + 2))}
            >
              <Text style={styles.fontButtonText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => canvasRef.current?.undo()}
          >
            <Text style={styles.actionButtonText}>Deshacer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => canvasRef.current?.clear()}
          >
            <Text style={styles.actionButtonText}>Borrar todo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerAction: { color: "#9CA3AF", fontSize: 15 },
  headerSave: { color: "#4CC9F0", fontWeight: "700" },
  canvasWrapper: { alignItems: "center", justifyContent: "center", flex: 1 },
  toolbar: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  input: {
    backgroundColor: "#1A1A22",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  colorRow: { flexGrow: 0 },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchSelected: { borderColor: "#fff" },
  fontControls: { flexDirection: "row", gap: 8 },
  fontButton: {
    backgroundColor: "#1A1A22",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fontButtonText: { color: "#fff", fontWeight: "700" },
  actionButton: {
    flex: 1,
    backgroundColor: "#1A1A22",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontWeight: "600" },
});
