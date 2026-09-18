import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ToolId } from "../types";

const ACTIVE_COLOR = "#4CC9F0";
const INACTIVE_COLOR = "#9CA3AF";

const TOOL_ITEMS: { id: ToolId; label: string; renderIcon: (color: string) => React.ReactNode }[] = [
  { id: "text", label: "Texto", renderIcon: (c) => <Ionicons name="text-outline" size={22} color={c} /> },
  { id: "brush", label: "Text Brush", renderIcon: (c) => <Ionicons name="brush-outline" size={22} color={c} /> },
  { id: "color", label: "Color", renderIcon: (c) => <Ionicons name="color-palette-outline" size={22} color={c} /> },
  { id: "size", label: "Tamaño", renderIcon: (c) => <Ionicons name="resize-outline" size={22} color={c} /> },
  { id: "font", label: "Fuente", renderIcon: (c) => <MaterialCommunityIcons name="format-font" size={22} color={c} /> },
  { id: "spacing", label: "Espaciado", renderIcon: (c) => <Ionicons name="options-outline" size={22} color={c} /> },
  { id: "opacity", label: "Opacidad", renderIcon: (c) => <Ionicons name="eye-outline" size={22} color={c} /> },
];

type Props = {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  exporting: boolean;
  canReplay: boolean;
  onReplay: () => void;
};

export default function BrushToolbar({
  activeTool,
  onSelectTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onExport,
  exporting,
  canReplay,
  onReplay,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {TOOL_ITEMS.map((item) => {
        const active = activeTool === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.button, active && styles.buttonActive]}
            onPress={() => onSelectTool(item.id)}
          >
            {item.renderIcon(active ? ACTIVE_COLOR : INACTIVE_COLOR)}
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.divider} />

      <TouchableOpacity style={styles.button} onPress={onReplay} disabled={!canReplay}>
        <Ionicons
          name="play-circle-outline"
          size={22}
          color={canReplay ? ACTIVE_COLOR : "#3A3A44"}
        />
        <Text style={[styles.label, canReplay && styles.labelActive, !canReplay && styles.labelDisabled]}>
          Reproducir
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onUndo} disabled={!canUndo}>
        <Ionicons name="arrow-undo-outline" size={22} color={canUndo ? INACTIVE_COLOR : "#3A3A44"} />
        <Text style={[styles.label, !canUndo && styles.labelDisabled]}>Deshacer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onRedo} disabled={!canRedo}>
        <Ionicons name="arrow-redo-outline" size={22} color={canRedo ? INACTIVE_COLOR : "#3A3A44"} />
        <Text style={[styles.label, !canRedo && styles.labelDisabled]}>Rehacer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onClear} disabled={!canUndo}>
        <Ionicons name="trash-outline" size={22} color={canUndo ? INACTIVE_COLOR : "#3A3A44"} />
        <Text style={[styles.label, !canUndo && styles.labelDisabled]}>Borrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onExport} disabled={exporting}>
        {exporting ? (
          <ActivityIndicator size="small" color={ACTIVE_COLOR} />
        ) : (
          <Ionicons name="download-outline" size={22} color={INACTIVE_COLOR} />
        )}
        <Text style={styles.label}>Exportar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "center", gap: 4, paddingHorizontal: 4 },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 64,
    gap: 4,
  },
  buttonActive: { backgroundColor: "#1A1A22" },
  label: { color: INACTIVE_COLOR, fontSize: 11, fontWeight: "600" },
  labelActive: { color: ACTIVE_COLOR },
  labelDisabled: { color: "#3A3A44" },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: "#2A2A33",
    marginHorizontal: 8,
  },
});
