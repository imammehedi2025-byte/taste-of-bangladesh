import { useEffect, useMemo, useState } from 'react';
import { DISTRICT_PATHS, MAP_H, MAP_W } from '../data/mapPaths';
import { DISTRICT_BY_ID, DISTRICTS } from '../data/districts';
import { layoutPins, textWidth } from '../utils/mapLayout';

export const MAP_COLORS = {
  tasted: '#C4352B',
  want: '#F0C14B',
  empty: '#F5EEDC',
  emptyOnDark: '#2A6450',
  stroke: '#0F4A37',
};

export interface DistrictPin {
  emoji: string;
  count: number;
}

interface Props {
  tasted: Set<string>;
  want?: Set<string>;
  /** emoji pin per tasted district */
  pins?: Record<string, DistrictPin>;
  showAllNames?: boolean;
  onSelect?: (districtId: string) => void;
  selected?: string | null;
  /** 'dark' sits on the paddy-green card, 'light' on paper */
  tone?: 'dark' | 'light';
  className?: string;
  label?: string;
}

const PIN_R = 16;
const LABEL_FONT = 19;
const LABEL_CSS = `600 ${LABEL_FONT}px "Hind Siliguri", sans-serif`;
const SMALL_CSS = `600 12.5px "Hind Siliguri", sans-serif`;
const NAMES_BN = Object.fromEntries(DISTRICTS.map((d) => [d.id, d.nameBn]));

/**
 * Bangladesh map with one shape per district. Tasted districts are filled red
 * (the sun on the flag) and carry an emoji pin of the food plus the district's name.
 * Want-to-try districts are gold. When onSelect is given, every district is tappable.
 */
export function TasteMap({ tasted, want, pins, showAllNames, onSelect, selected, tone = 'light', className = '', label }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  // re-measure labels once web fonts have loaded
  const [fontsReady, setFontsReady] = useState(0);
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => alive && setFontsReady((n) => n + 1));
    return () => {
      alive = false;
    };
  }, []);
  const dark = tone === 'dark';
  const ids = Object.keys(DISTRICT_PATHS);
  const interactive = !!onSelect;
  const pinIds = useMemo(() => (pins ? Object.keys(pins) : []), [pins]);

  const layout = useMemo(
    () => layoutPins(pinIds, (t) => textWidth(t, LABEL_CSS) * 1.08, NAMES_BN, PIN_R, LABEL_FONT),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pinIds, fontsReady],
  );
  // small names for every other district, skipped where they would collide with a pin or label
  const smallNames = useMemo(() => {
    if (!showAllNames) return [];
    const taken = layout.flatMap((l) => {
      const boxes = [{ x0: l.x - PIN_R, y0: l.y - PIN_R, x1: l.x + PIN_R, y1: l.y + PIN_R }];
      if (l.label) {
        const w = textWidth(NAMES_BN[l.id], LABEL_CSS) * 1.08;
        const x0 = l.label.anchor === 'start' ? l.label.x : l.label.anchor === 'end' ? l.label.x - w : l.label.x - w / 2;
        boxes.push({ x0, y0: l.label.y - LABEL_FONT * 0.6, x1: x0 + w, y1: l.label.y + LABEL_FONT * 0.6 });
      }
      return boxes;
    });
    return ids
      .filter((id) => !pins?.[id])
      .filter((id) => {
        const { cx, cy } = DISTRICT_PATHS[id];
        const w = textWidth(NAMES_BN[id], SMALL_CSS) * 1.05;
        const b = { x0: cx - w / 2, y0: cy - 8, x1: cx + w / 2, y1: cy + 8 };
        if (b.x0 < 0 || b.x1 > MAP_W) return false;
        return !taken.some((t) => t.x0 < b.x1 && t.x1 > b.x0 && t.y0 < b.y1 && t.y1 > b.y0);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllNames, layout]);
  const labelled = new Set(layout.filter((l) => l.label).map((l) => l.id));
  const floating = hover ?? selected ?? null;
  const showFloating = floating && !labelled.has(floating) && !showAllNames;

  const halo = dark ? '#0A3627' : '#FBF7EC';
  const ink = dark ? '#FBF7EC' : '#22201C';

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="h-auto w-full select-none"
        role={interactive ? 'group' : 'img'}
        aria-label={label ?? `Map of Bangladesh: ${tasted.size} of 64 districts tasted`}
      >
        {ids.map((id) => {
          const p = DISTRICT_PATHS[id];
          const isT = tasted.has(id);
          const isW = !isT && want?.has(id);
          const isSel = selected === id;
          const fill = isT ? MAP_COLORS.tasted : isW ? MAP_COLORS.want : dark ? MAP_COLORS.emptyOnDark : MAP_COLORS.empty;
          const d = DISTRICT_BY_ID[id];
          return (
            <path
              key={id}
              d={p.d}
              fill={fill}
              stroke={dark ? (isT ? '#FBF7EC' : '#4E8670') : MAP_COLORS.stroke}
              strokeWidth={isSel ? 3 : dark ? 0.9 : 0.8}
              strokeLinejoin="round"
              className={`transition-[fill,opacity] duration-500 ${interactive ? 'cursor-pointer outline-none hover:opacity-80 focus-visible:opacity-80' : ''}`}
              style={isSel ? { filter: 'drop-shadow(0 0 6px rgba(224,162,28,.9))' } : undefined}
              {...(interactive
                ? {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': `${d.nameEn} (${d.nameBn})${isT ? ', tasted' : isW ? ', want to try' : ''}`,
                    onClick: () => onSelect!(id),
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect!(id);
                      }
                    },
                    onMouseEnter: () => setHover(id),
                    onMouseLeave: () => setHover(null),
                    onFocus: () => setHover(id),
                    onBlur: () => setHover(null),
                  }
                : {})}
            />
          );
        })}

        {/* all 64 names, small, when asked for */}
        {showAllNames && (
          <g pointerEvents="none" className="bnui" fontWeight="600" fontSize="12.5" textAnchor="middle" dominantBaseline="middle">
            {smallNames.map((id) => (
                <text key={id} x={DISTRICT_PATHS[id].cx} y={DISTRICT_PATHS[id].cy} fill={ink} stroke={halo} strokeWidth="3" paintOrder="stroke" opacity="0.9">
                  {NAMES_BN[id]}
                </text>
            ))}
          </g>
        )}

        {/* emoji pins and names for tasted districts */}
        <g pointerEvents="none">
          {layout.map((l) => {
            const pin = pins![l.id];
            return (
              <g key={l.id}>
                <circle cx={l.x} cy={l.y} r={PIN_R} fill="#FBF7EC" stroke={MAP_COLORS.tasted} strokeWidth="2.5" />
                <text x={l.x} y={l.y + 1} textAnchor="middle" dominantBaseline="central" fontSize="19">
                  {pin.emoji}
                </text>
                {pin.count > 1 && (
                  <g>
                    <circle cx={l.x + PIN_R * 0.8} cy={l.y - PIN_R * 0.8} r="8" fill="#E0A21C" />
                    <text x={l.x + PIN_R * 0.8} y={l.y - PIN_R * 0.8 + 0.5} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="700" fill="#22201C">
                      {pin.count}
                    </text>
                  </g>
                )}
                {l.label && (
                  <text
                    x={l.label.x}
                    y={l.label.y}
                    textAnchor={l.label.anchor}
                    dominantBaseline="central"
                    className="bnui"
                    fontSize={LABEL_FONT}
                    fontWeight="600"
                    fill={ink}
                    stroke={halo}
                    strokeWidth="4"
                    paintOrder="stroke"
                  >
                    {NAMES_BN[l.id]}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* hovered / selected district name when it has no label yet */}
        {showFloating && DISTRICT_PATHS[floating] && (
          <text
            pointerEvents="none"
            x={DISTRICT_PATHS[floating].cx}
            y={DISTRICT_PATHS[floating].cy}
            textAnchor="middle"
            dominantBaseline="middle"
            className="bnui"
            fontSize="22"
            fontWeight="700"
            fill={ink}
            stroke={halo}
            strokeWidth="5"
            paintOrder="stroke"
          >
            {NAMES_BN[floating]}
          </text>
        )}
      </svg>
    </div>
  );
}

export function MapLegend({ tone = 'light', showWant = true }: { tone?: 'dark' | 'light'; showWant?: boolean }) {
  const dark = tone === 'dark';
  const item = (color: string, text: string, border?: string) => (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-3.5 w-3.5 rounded-[4px]" style={{ background: color, border: `1px solid ${border ?? color}` }} />
      {text}
    </span>
  );
  return (
    <div className={`bnui flex flex-wrap gap-x-4 gap-y-1 text-sm ${dark ? 'text-paper-hi/85' : 'text-ink-soft'}`}>
      {item(MAP_COLORS.tasted, 'খেয়েছি')}
      {showWant && item(MAP_COLORS.want, 'খেতে চাই')}
      {item(dark ? MAP_COLORS.emptyOnDark : MAP_COLORS.empty, 'এখনো বাকি', dark ? '#4E8670' : '#0F4A37')}
    </div>
  );
}

export function NamesToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={`bnui rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
        on ? 'border-turmeric bg-turmeric text-ink' : 'border-paper-hi/40 text-paper-hi/90 hover:border-paper-hi'
      }`}
    >
      {on ? 'নাম লুকাও' : 'সব জেলার নাম দেখাও'}
    </button>
  );
}
