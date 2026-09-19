import React, { forwardRef } from "react";
import { Image, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { ImageDocument, StickerElement } from "../types";
import TextBrush, { type TextBrushHandle } from "./TextBrush";
import StickerLayer from "./StickerLayer";

const MIN_SCALE = 1;
const MAX_SCALE = 6;

type Props = {
  document: ImageDocument;
  /** Base (unzoomed) display size that preserves the photo's aspect ratio. */
  baseWidth: number;
  baseHeight: number;
  /** Whether the active tool draws (brush drag or single tap) vs. just navigating. */
  drawingEnabled: boolean;
  drawMode: "brush" | "tap";
  stickers: StickerElement[];
  stickersInteractive: boolean;
};

/**
 * Renders the photo inside a pinch-to-zoom + two-finger-pan viewport, with
 * the Text Brush overlay living in the SAME transformed layer as the image
 * so drawn text scales and pans together with the photo. Because the drawing
 * gesture is attached to the untransformed inner content view, the
 * coordinates it reports stay in stable "document space" regardless of the
 * current zoom level.
 */
const ImageCanvas = forwardRef<TextBrushHandle, Props>(function ImageCanvas(
  { document, baseWidth, baseHeight, drawingEnabled, drawMode, stickers, stickersInteractive },
  ref
) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const next = savedScale.value * event.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE) {
        scale.value = withTiming(MIN_SCALE);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const panZoomGesture = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedNavigationGesture = Gesture.Simultaneous(pinchGesture, panZoomGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedNavigationGesture}>
      <Animated.View style={[{ width: baseWidth, height: baseHeight }, animatedStyle]}>
        <Image
          source={{ uri: document.uri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <TextBrush
          ref={ref}
          width={baseWidth}
          height={baseHeight}
          enabled={drawingEnabled}
          mode={drawMode}
        />
        <StickerLayer stickers={stickers} interactive={stickersInteractive} />
      </Animated.View>
    </GestureDetector>
  );
});

export default ImageCanvas;
