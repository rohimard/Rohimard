import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ColorPicker from "./ColorPicker";
import FontPicker from "./FontPicker";
import type { BrushSettings as BrushSettingsType, ToolId } from "../types";

type Props = {
  activeTool: ToolId;
  settings: BrushSettingsType;
  onChange: (patch: Partial<BrushSettingsType>) => void;
};

/** The contextual panel that appears above the toolbar for Color/Tamaño/Fuente/Espaciado/Opacidad. */
export default function BrushSettingsPanel({ activeTool, settings, onChange }: Props) {
  switch (activeTool) {
    case "color":
      return <ColorPicker value={settings.color} onChange={(color) => onChange({ color })} />;
    case "font":
      return <FontPicker value={settings.fontId} onChange={(fontId) => onChange({ fontId })} />;
    case "size":
      return (
        <SteppedControl
          label="Tamaño"
          value={settings.fontSize}
          min={12}
          max={72}
          step={2}
          onChange={(fontSize) => onChange({ fontSize })}
        />
      );
    case "spacing":
      return (
        <SteppedControl
          label="Espaciado"
          value={settings.spacing}
          min={30}
          max={220}
          step={10}
          onChange={(spacing) => onChange({ spacing })}
        />
      );
    case "opacity":
      return (
        <SteppedControl
          label="Opacidad"
          value={Math.round(settings.opacity * 100)}
          min={10}
          max={100}
          step={10}
          suffix="%"
          onChange={(percent) => onChange({ opacity: percent / 100 })}
        />
      );
    default:
      return null;
  }
}

type SteppedControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function SteppedControl({ label, value, min, max, step, suffix = "", onChange }: SteppedControlProps) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={styles.stepperButton}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={styles.stepperButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>
          {value}
          {suffix}
        </Text>
        <TouchableOpacity
          style={styles.stepperButton}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={styles.stepperButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepperLabel: { color: "#9CA3AF", fontSize: 14 },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepperButton: {
    backgroundColor: "#1A1A22",
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  stepperValue: { color: "#fff", fontWeight: "700", fontSize: 15, minWidth: 44, textAlign: "center" },
});
