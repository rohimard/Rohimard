import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

export const BRUSH_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF3B6F",
  "#FFD23F",
  "#4CC9F0",
  "#7C3AED",
  "#22C55E",
  "#F97316",
];

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {BRUSH_COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          onPress={() => onChange(color)}
          style={[styles.swatch, { backgroundColor: color }, value === color && styles.selected]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingVertical: 4 },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selected: { borderColor: "#fff" },
});
