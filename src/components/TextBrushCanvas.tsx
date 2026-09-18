import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, PanResponder, StyleSheet } from "react-native";
import Svg, { Path, Text as SvgText, TextPath } from "react-native-svg";

export type TextBrushCanvasHandle = {
  undo: () => void;
  clear: () => void;
};

type Point = { x: number; y: number };

type Stroke = {
  id: string;
  d: string;
  phrase: string;
  color: string;
  fontSize: number;
};

type Props = {
  width: number;
  height: number;
  phrase: string;
  color: string;
  fontSize: number;
};

// How many times the phrase repeats along a stroke. The SVG textPath simply
// clips whatever doesn't fit, so we just need "enough" repeats for long strokes.
const REPEAT_COUNT = 14;
// Minimum squared distance (px) between recorded points, to avoid flooding
// the path with redundant points from touch move events.
const MIN_POINT_DISTANCE_SQ = 9;

function buildPathFromPoints(points: Point[]) {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(" ");
}

let strokeCounter = 0;

const TextBrushCanvas = forwardRef<TextBrushCanvasHandle, Props>(
  ({ width, height, phrase, color, fontSize }, ref) => {
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentD, setCurrentD] = useState("");
    const currentPoints = useRef<Point[]>([]);

    useImperativeHandle(ref, () => ({
      undo: () => setStrokes((prev) => prev.slice(0, -1)),
      clear: () => setStrokes([]),
    }));

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          currentPoints.current = [{ x: locationX, y: locationY }];
          setCurrentD(`M ${locationX} ${locationY}`);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          const last = currentPoints.current[currentPoints.current.length - 1];
          if (last) {
            const dx = locationX - last.x;
            const dy = locationY - last.y;
            if (dx * dx + dy * dy < MIN_POINT_DISTANCE_SQ) return;
          }
          currentPoints.current.push({ x: locationX, y: locationY });
          setCurrentD(buildPathFromPoints(currentPoints.current));
        },
        onPanResponderRelease: () => {
          if (currentPoints.current.length > 1) {
            strokeCounter += 1;
            setStrokes((prev) => [
              ...prev,
              {
                id: `stroke-${strokeCounter}`,
                d: buildPathFromPoints(currentPoints.current),
                phrase,
                color,
                fontSize,
              },
            ]);
          }
          currentPoints.current = [];
          setCurrentD("");
        },
      })
    ).current;

    const repeatedText = (text: string) => {
      const trimmed = text.trim() || " ";
      return Array(REPEAT_COUNT).fill(trimmed).join("   •   ");
    };

    return (
      <View
        style={[styles.canvas, { width, height }]}
        {...panResponder.panHandlers}
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {strokes.map((s) => (
            <React.Fragment key={s.id}>
              <Path id={s.id} d={s.d} stroke="none" fill="none" />
              <SvgText fill={s.color} fontSize={s.fontSize} fontWeight="700">
                <TextPath href={`#${s.id}`}>{repeatedText(s.phrase)}</TextPath>
              </SvgText>
            </React.Fragment>
          ))}
          {currentD ? (
            <Path
              d={currentD}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="none"
              opacity={0.6}
            />
          ) : null}
        </Svg>
      </View>
    );
  }
);

export default TextBrushCanvas;

const styles = StyleSheet.create({
  canvas: {
    overflow: "hidden",
  },
});
