import { DISTRICT_PATHS, MAP_H, MAP_W } from '../data/mapPaths';

export interface PinLayout {
  id: string;
  x: number;
  y: number;
  /** null when no free spot was found; the name still appears in the list */
  label: { x: number; y: number; anchor: 'start' | 'middle' | 'end' } | null;
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
const hit = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/**
 * Places one pin per district (at its centroid, nudged apart when two sit on top of
 * each other) and a name label beside each pin where it fits without overlapping
 * another label or pin. All numbers are in map units (viewBox MAP_W × MAP_H).
 */
export function layoutPins(ids: string[], measure: (text: string) => number, names: Record<string, string>, pinR: number, font: number): PinLayout[] {
  const pins = ids
    .filter((id) => DISTRICT_PATHS[id])
    .map((id) => ({ id, x: DISTRICT_PATHS[id].cx, y: DISTRICT_PATHS[id].cy }));

  // relax overlapping pins a little
  const min = pinR * 2 + 2;
  for (let it = 0; it < 30; it++) {
    let moved = false;
    for (let i = 0; i < pins.length; i++)
      for (let j = i + 1; j < pins.length; j++) {
        const a = pins[i];
        const b = pins[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d >= min) continue;
        if (d < 0.01) {
          dx = 1;
          dy = 0;
          d = 1;
        }
        const push = (min - d) / 2;
        a.x -= (dx / d) * push;
        a.y -= (dy / d) * push;
        b.x += (dx / d) * push;
        b.y += (dy / d) * push;
        moved = true;
      }
    if (!moved) break;
  }

  const pinBoxes: Box[] = pins.map((p) => ({ x0: p.x - pinR, y0: p.y - pinR, x1: p.x + pinR, y1: p.y + pinR }));
  const placed: Box[] = [];
  const h = font * 1.15;
  const gap = 3;

  // place labels top-to-bottom so crowded areas resolve predictably
  const order = [...pins.keys()].sort((a, b) => pins[a].y - pins[b].y);
  const out: PinLayout[] = pins.map((p) => ({ ...p, label: null }));

  for (const i of order) {
    const p = pins[i];
    const w = measure(names[p.id] ?? p.id);
    const cands: { x: number; y: number; anchor: 'start' | 'middle' | 'end'; box: Box }[] = [
      { x: p.x + pinR + gap, y: p.y, anchor: 'start', box: { x0: p.x + pinR + gap, y0: p.y - h / 2, x1: p.x + pinR + gap + w, y1: p.y + h / 2 } },
      { x: p.x - pinR - gap, y: p.y, anchor: 'end', box: { x0: p.x - pinR - gap - w, y0: p.y - h / 2, x1: p.x - pinR - gap, y1: p.y + h / 2 } },
      { x: p.x, y: p.y + pinR + gap + h / 2, anchor: 'middle', box: { x0: p.x - w / 2, y0: p.y + pinR + gap, x1: p.x + w / 2, y1: p.y + pinR + gap + h } },
      { x: p.x, y: p.y - pinR - gap - h / 2, anchor: 'middle', box: { x0: p.x - w / 2, y0: p.y - pinR - gap - h, x1: p.x + w / 2, y1: p.y - pinR - gap } },
    ];
    for (const c of cands) {
      const b = c.box;
      if (b.x0 < 2 || b.x1 > MAP_W - 2 || b.y0 < 2 || b.y1 > MAP_H - 2) continue;
      if (placed.some((q) => hit(q, b))) continue;
      if (pinBoxes.some((q, k) => k !== i && hit(q, b))) continue;
      placed.push(b);
      out[i].label = { x: c.x, y: c.y, anchor: c.anchor };
      break;
    }
  }
  return out;
}

let measureCtx: CanvasRenderingContext2D | null = null;
/** Text width in px for a given CSS font, using a shared offscreen canvas. */
export function textWidth(text: string, font: string): number {
  if (typeof document === 'undefined') return text.length * 10;
  measureCtx ||= document.createElement('canvas').getContext('2d');
  if (!measureCtx) return text.length * 10;
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}
