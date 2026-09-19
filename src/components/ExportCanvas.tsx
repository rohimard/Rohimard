import React, { forwardRef } from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg from "react-native-svg";
import TextElementGlyph from "./TextElementGlyph";
import type { ImageDocument, StickerElement, TextElement } from "../types";

type Props = {
  document: ImageDocument;
  width: number;
  height: number;
  elements: TextElement[];
  stickers?: StickerElement[];
};

/**
 * An always-unzoomed, off-screen copy of the composition (photo + every
 * committed text element and sticker, never the live in-progress stroke),
 * kept mounted so ExportManager can snapshot it regardless of the on-screen
 * canvas' pan or zoom. `collapsable={false}` stops Android from flattening
 * this view out of the native tree, which would make it uncapturable.
 */
const ExportCanvas = forwardRef<View, Props>(({ document, width, height, elements, stickers = [] }, ref) => {
  return (
    <View ref={ref} collapsable={false} pointerEvents="none" style={[styles.hidden, { width, height }]}>
      <Image source={{ uri: document.uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      {stickers.map((sticker) => {
        const size = sticker.baseSize * sticker.scale;
        return (
          <Image
            key={sticker.id}
            source={{ uri: sticker.uri }}
            style={{
              position: "absolute",
              left: sticker.x - size / 2,
              top: sticker.y - size / 2,
              width: size,
              height: size,
              transform: [{ rotate: `${sticker.rotation}deg` }],
            }}
            resizeMode="contain"
          />
        );
      })}
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
