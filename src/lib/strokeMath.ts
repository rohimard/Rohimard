import type { BrushSettings, TextElement } from "../types";

export interface Point {
  x: number;
  y: number;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function angleBetween(a: Point, b: Point): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

function makeElement(
  x: number,
  y: number,
  rotation: number,
  index: number,
  idPrefix: string,
  settings: BrushSettings
): TextElement {
  return {
    id: `${idPrefix}-${index}`,
    text: settings.phrase,
    x,
    y,
    rotation,
    color: settings.color,
    fontSize: settings.fontSize,
    fontId: settings.fontId,
    opacity: settings.opacity,
  };
}

/**
 * Resamples a raw finger-drawn polyline into evenly spaced, rotated text
 * instances ("stamps") following the local direction of the path — the core
 * Text Brush algorithm. Pure function: same input always yields the same
 * output, so it's safe to call on every gesture-move frame and on release.
 */
export function buildStampedElements(
  points: Point[],
  settings: BrushSettings,
  idPrefix: string
): TextElement[] {
  const phrase = settings.phrase.trim();
  if (points.length < 2 || !phrase) return [];

  const spacing = Math.max(settings.spacing, 4);
  const normalizedSettings: BrushSettings = { ...settings, phrase };
  const elements: TextElement[] = [];
  let index = 0;

  const firstAngle = angleBetween(points[0], points[1]);
  elements.push(makeElement(points[0].x, points[0].y, firstAngle, index++, idPrefix, normalizedSettings));

  let carry = spacing;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const segmentLength = distance(prev, curr);
    if (segmentLength === 0) continue;
    const angle = angleBetween(prev, curr);

    let consumed = 0;
    while (consumed + carry <= segmentLength) {
      consumed += carry;
      const t = consumed / segmentLength;
      const x = prev.x + (curr.x - prev.x) * t;
      const y = prev.y + (curr.y - prev.y) * t;
      elements.push(makeElement(x, y, angle, index++, idPrefix, normalizedSettings));
      carry = spacing;
    }
    carry -= segmentLength - consumed;
  }

  return elements;
}

/** Squared distance, used to threshold how many raw touch points we keep. */
export function distanceSq(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
}

/** Builds a single, unrotated text placement — used by the tap-to-place "Texto" tool. */
export function makeStandaloneElement(
  point: Point,
  settings: BrushSettings,
  id: string
): TextElement | null {
  const phrase = settings.phrase.trim();
  if (!phrase) return null;
  return {
    id,
    text: phrase,
    x: point.x,
    y: point.y,
    rotation: 0,
    color: settings.color,
    fontSize: settings.fontSize,
    fontId: settings.fontId,
    opacity: settings.opacity,
  };
}
