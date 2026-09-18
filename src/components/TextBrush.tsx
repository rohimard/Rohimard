import React, { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg from "react-native-svg";
import { useEditor } from "../state/EditorContext";
import {
  buildStampedElements,
  distanceSq,
  makeStandaloneElement,
  type Point,
} from "../lib/strokeMath";
import TextElementGlyph from "./TextElementGlyph";
import type { TextElement, TextStroke } from "../types";

const MIN_POINT_DISTANCE_SQ = 9;
let strokeCounter = 0;

type Props = {
  width: number;
  height: number;
  enabled: boolean;
  mode: "brush" | "tap";
};

/**
 * The Text Brush drawing engine: captures the finger gesture, resamples it
 * into rotated text stamps in real time (see lib/strokeMath), and commits
 * the finished stroke to editor history on release. Also handles the
 * single-tap "Texto" placement tool via the same component, since both
 * share rendering and the same underlying settings.
 *
 * Gesture callbacks run on the JS thread (`.runOnJS(true)`) and only touch
 * React state through a distance-thresholded point list, so a fast drag
 * doesn't flood the reconciler with a re-render per pixel.
 */
export default function TextBrush({ width, height, enabled, mode }: Props) {
  const { state, elements, commitStroke } = useEditor();
  const [liveElements, setLiveElements] = useState<TextElement[]>([]);
  const pointsRef = useRef<Point[]>([]);

  const finishBrushStroke = () => {
    const points = pointsRef.current;
    pointsRef.current = [];
    setLiveElements([]);
    if (points.length < 2) return;
    strokeCounter += 1;
    const stamped = buildStampedElements(points, state.settings, `stroke-${strokeCounter}`);
    if (stamped.length === 0) return;
    const stroke: TextStroke = {
      id: `stroke-${strokeCounter}`,
      tool: "brush",
      elements: stamped,
      createdAt: Date.now(),
    };
    commitStroke(stroke);
  };

  const finishTap = (point: Point) => {
    strokeCounter += 1;
    const element = makeStandaloneElement(point, state.settings, `stroke-${strokeCounter}`);
    if (!element) return;
    const stroke: TextStroke = {
      id: `stroke-${strokeCounter}`,
      tool: "text",
      elements: [element],
      createdAt: Date.now(),
    };
    commitStroke(stroke);
  };

  const panGesture = Gesture.Pan()
    .enabled(enabled && mode === "brush")
    .minPointers(1)
    .maxPointers(1)
    .onStart((event) => {
      pointsRef.current = [{ x: event.x, y: event.y }];
    })
    .onUpdate((event) => {
      const point = { x: event.x, y: event.y };
      const last = pointsRef.current[pointsRef.current.length - 1];
      if (last && distanceSq(last, point) < MIN_POINT_DISTANCE_SQ) return;
      pointsRef.current.push(point);
      setLiveElements(buildStampedElements(pointsRef.current, state.settings, "live"));
    })
    .onEnd(finishBrushStroke)
    .runOnJS(true);

  const tapGesture = Gesture.Tap()
    .enabled(enabled && mode === "tap")
    .onEnd((event) => {
      finishTap({ x: event.x, y: event.y });
    })
    .runOnJS(true);

  const gesture = Gesture.Race(panGesture, tapGesture);

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.overlay, { width, height }]} pointerEvents={enabled ? "auto" : "none"}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {elements.map((el) => (
            <TextElementGlyph key={el.id} element={el} />
          ))}
          {liveElements.map((el) => (
            <TextElementGlyph key={el.id} element={el} />
          ))}
        </Svg>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
