import React from "react";
import { Text as SvgText } from "react-native-svg";
import { resolveFontFamily } from "../lib/fonts";
import type { TextElement } from "../types";

/** Renders one stamped/placed text instance. Shared by the live editor and the export snapshot. */
export default function TextElementGlyph({ element }: { element: TextElement }) {
  const fontFamily = resolveFontFamily(element.fontId);
  return (
    <SvgText
      x={element.x}
      y={element.y}
      fill={element.color}
      fontSize={element.fontSize}
      fontFamily={fontFamily}
      fontWeight={fontFamily ? undefined : "700"}
      opacity={element.opacity}
      textAnchor="middle"
      transform={`rotate(${element.rotation} ${element.x} ${element.y})`}
    >
      {element.text}
    </SvgText>
  );
}
