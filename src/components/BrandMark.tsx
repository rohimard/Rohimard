import React from "react";
import Svg, { Text as SvgText } from "react-native-svg";
import { BRAND_FONT_BOLD } from "../lib/fonts";

type Props = {
  width: number;
  height: number;
  /** Overall opacity multiplier, for using this as a quiet background flourish. */
  opacity?: number;
};

const CX = 512;
const CY = 1180;
const R = 760;
const THETA_START = (250 * Math.PI) / 180;
const THETA_END = (297 * Math.PI) / 180;

function arcPoint(t: number) {
  const theta = THETA_START + (THETA_END - THETA_START) * t;
  return { x: CX + R * Math.cos(theta), y: CY + R * Math.sin(theta), theta };
}
function arcTangentDeg(theta: number) {
  return (theta * 180) / Math.PI + 90;
}

const STAMPS = [
  { t: 0.02, size: 120, color: "#2f7f9c", opacity: 0.6 },
  { t: 0.26, size: 168, color: "#4cc9f0", opacity: 0.9 },
  { t: 0.5, size: 208, color: "#4cc9f0", opacity: 1 },
  { t: 0.74, size: 192, color: "#4cc9f0", opacity: 1 },
  { t: 0.98, size: 236, color: "#ffd23f", opacity: 1 },
];

/**
 * The brand mark: the letter "P" stamped and rotated along an arc — the same
 * shape as the app icon — used as a quiet decorative flourish behind screen
 * chrome. Pure visual, not connected to the Text Brush engine.
 */
export default function BrandMark({ width, height, opacity = 1 }: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 1024 1024"
      preserveAspectRatio="xMidYMid slice"
      opacity={opacity}
    >
      {STAMPS.map((s, i) => {
        const pt = arcPoint(s.t);
        const angle = arcTangentDeg(pt.theta);
        return (
          <SvgText
            key={i}
            x={pt.x}
            y={pt.y}
            fontSize={s.size}
            fontFamily={BRAND_FONT_BOLD}
            fill={s.color}
            opacity={s.opacity}
            textAnchor="middle"
            transform={`rotate(${angle} ${pt.x} ${pt.y})`}
          >
            P
          </SvgText>
        );
      })}
    </Svg>
  );
}
