import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
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
// How long to hold the last stamp on screen after it appears, at the end of a replay.
const REPLAY_TAIL_MS = 150;
let strokeCounter = 0;

export type TextBrushHandle = {
  /** Re-plays a previously committed brush stroke at the exact cadence it was drawn. */
  replayStroke: (strokeId: string) => void;
};

type Props = {
  width: number;
  height: number;
  enabled: boolean;
  mode: "brush" | "tap";
};

type ReplayState = {
  strokeId: string;
  startedAt: number;
  maxTimeMs: number;
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
 *
 * Each raw point also carries a timestamp, so a finished brush stroke can
 * later be replayed at the exact cadence it was drawn (see replayStroke) —
 * the MotionBrush prototype's core mechanic.
 */
const TextBrush = forwardRef<TextBrushHandle, Props>(function TextBrush(
  { width, height, enabled, mode },
  ref
) {
  const { state, commitStroke } = useEditor();
  const [liveElements, setLiveElements] = useState<TextElement[]>([]);
  const pointsRef = useRef<Point[]>([]);
  const strokeStartRef = useRef(0);

  const [replay, setReplay] = useState<ReplayState | null>(null);
  const [, forceTick] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!replay) return undefined;
    let active = true;
    const loop = () => {
      if (!active) return;
      const elapsed = Date.now() - replay.startedAt;
      if (elapsed >= replay.maxTimeMs + REPLAY_TAIL_MS) {
        setReplay(null);
        return;
      }
      forceTick((n) => n + 1);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [replay]);

  useImperativeHandle(
    ref,
    () => ({
      replayStroke: (strokeId: string) => {
        const stroke = state.strokes.find((s) => s.id === strokeId);
        if (!stroke || stroke.elements.length === 0) return;
        const maxTimeMs = Math.max(...stroke.elements.map((el) => el.timeMs));
        setReplay({ strokeId, startedAt: Date.now(), maxTimeMs });
      },
    }),
    [state.strokes]
  );

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
      strokeStartRef.current = Date.now();
      pointsRef.current = [{ x: event.x, y: event.y, t: 0 }];
    })
    .onUpdate((event) => {
      const point = { x: event.x, y: event.y, t: Date.now() - strokeStartRef.current };
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

  const now = Date.now();
  const visibleElements = state.strokes.flatMap((stroke) => {
    if (replay && replay.strokeId === stroke.id) {
      const elapsed = now - replay.startedAt;
      return stroke.elements.filter((el) => el.timeMs <= elapsed);
    }
    return stroke.elements;
  });

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.overlay, { width, height }]} pointerEvents={enabled ? "auto" : "none"}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {visibleElements.map((el) => (
            <TextElementGlyph key={el.id} element={el} />
          ))}
          {liveElements.map((el) => (
            <TextElementGlyph key={el.id} element={el} />
          ))}
        </Svg>
      </View>
    </GestureDetector>
  );
});

export default TextBrush;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
