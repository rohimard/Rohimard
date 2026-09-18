import React, { forwardRef } from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg from "react-native-svg";
import TextElementGlyph from "./TextElementGlyph";
import type { ImageDocument, TextElement } from "../types";

type Props = {
  document: ImageDocument;
  width: number;
  height: number;
  elements: TextElement[];
};

/**
 * An always-unzoomed, off-screen copy of the composition (photo + every
 * committed text element, never the live in-progress stroke), kept mounted
 * so ExportManager can snapshot it regardless of the on-screen canvas' pan
 * or zoom. `collapsable={false}` stops Android from flattening this view
 * out of the native tree, which would make it uncapturable.
 */
const ExportCanvas = forwardRef<View, Props>(({ document, width, height, elements }, ref) => {
  return (
    <View ref={ref} collapsable={false} pointerEvents="none" style={[styles.hidden, { width, height }]}>
      <Image source={{ uri: document.uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {elements.map((el) => (
          <TextElementGlyph key={el.id} element={el} />
        ))}
      </Svg>
    </View>
  );
});

ExportCanvas.displayName = "ExportCanvas";

export default ExportCanvas;

const styles = StyleSheet.create({
  hidden: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0,
  },
});
