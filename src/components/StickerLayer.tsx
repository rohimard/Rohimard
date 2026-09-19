import React from "react";
import { Image, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from "react-native-reanimated";
import { useEditor } from "../state/EditorContext";
import type { StickerElement } from "../types";

const MIN_SCALE = 0.3;
const MAX_SCALE = 4;

function StaticSticker({ sticker }: { sticker: StickerElement }) {
  const size = sticker.baseSize * sticker.scale;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: sticker.x - size / 2,
        top: sticker.y - size / 2,
        width: size,
        height: size,
        transform: [{ rotate: `${sticker.rotation}deg` }],
      }}
    >
      <Image source={{ uri: sticker.uri }} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}

/** One placed sticker: draggable, pinch-to-scale, twist-to-rotate; double-tap deletes it. */
function InteractiveSticker({ sticker }: { sticker: StickerElement }) {
  const { updateSticker, removeSticker } = useEditor();

  const translateX = useSharedValue(sticker.x);
  const translateY = useSharedValue(sticker.y);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);

  const startX = useSharedValue(sticker.x);
  const startY = useSharedValue(sticker.y);
  const startScale = useSharedValue(sticker.scale);
  const startRotation = useSharedValue(sticker.rotation);

  const commitMove = (x: number, y: number) => updateSticker(sticker.id, { x, y });
  const commitScale = (s: number) => updateSticker(sticker.id, { scale: s });
  const commitRotation = (r: number) => updateSticker(sticker.id, { rotation: r });
  const remove = () => removeSticker(sticker.id);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(commitMove)(translateX.value, translateY.value);
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(commitScale)(scale.value);
    });

  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + (e.rotation * 180) / Math.PI;
    })
    .onEnd(() => {
      runOnJS(commitRotation)(rotation.value);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(remove)();
    });

  const gesture = Gesture.Race(doubleTap, Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture));

  const animatedStyle = useAnimatedStyle(() => {
    const size = sticker.baseSize * scale.value;
    return {
      position: "absolute",
      left: translateX.value - size / 2,
      top: translateY.value - size / 2,
      width: size,
      height: size,
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.Image source={{ uri: sticker.uri }} style={animatedStyle} resizeMode="contain" />
    </GestureDetector>
  );
}

type Props = {
  stickers: StickerElement[];
  /** Only the "sticker" tool makes placed stickers draggable — otherwise touches pass through to the active tool. */
  interactive: boolean;
};

/** Renders every placed sticker; only draggable/resizable while the sticker tool is active. */
export default function StickerLayer({ stickers, interactive }: Props) {
  return (
    <>
      {stickers.map((sticker) =>
        interactive ? (
          <InteractiveSticker key={sticker.id} sticker={sticker} />
        ) : (
          <StaticSticker key={sticker.id} sticker={sticker} />
        )
      )}
    </>
  );
}
