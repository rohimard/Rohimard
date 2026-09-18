import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FONT_LIST } from "../lib/fonts";
import type { FontId } from "../types";

type Props = {
  value: FontId;
  onChange: (fontId: FontId) => void;
};

export default function FontPicker({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FONT_LIST.map((font) => (
        <TouchableOpacity
          key={font.id}
          onPress={() => onChange(font.id)}
          style={[styles.chip, value === font.id && styles.chipSelected]}
        >
          <Text style={[styles.chipText, { fontFamily: font.fontFamily }]}>{font.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    backgroundColor: "#1A1A22",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipSelected: { borderColor: "#4CC9F0" },
  chipText: { color: "#fff", fontSize: 15 },
});
