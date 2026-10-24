import { useState } from 'react';
import { DISTRICT_PATHS, MAP_H, MAP_W } from '../data/mapPaths';
import { DISTRICT_BY_ID } from '../data/districts';

export const MAP_COLORS = {
  tasted: '#C4352B',
  want: '#F0C14B',
  empty: '#F5EEDC',
  emptyOnDark: '#2A6450',
  stroke: '#0F4A37',
};

interface Props {
  tasted: Set<string>;
  want?: Set<string>;
  onSelect?: (districtId: string) => void;
  selected?: string | null;
  /** 'dark' sits on the paddy-green card, 'light' on paper */
  tone?: 'dark' | 'light';
  className?: string;
  label?: string;
}

/**
 * Bangladesh map with one shape per district. Tasted districts are filled red
 * (the sun on the flag), want-to-try districts are gold, the rest stay plain.
 * When onSelect is given, every district is a tappable button.
 */
export function TasteMap({ tasted, want, onSelect, selected, tone = 'light', className = '', label }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const dark = tone === 'dark';
  const ids = Object.keys(DISTRICT_PATHS);
  const shown = hover ?? selected ?? null;
  const interactive = !!onSelect;

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
        {/* selected / hovered district gets its name drawn on the map */}
        {shown && DISTRICT_PATHS[shown] && (
          <g pointerEvents="none">
            <text
              x={DISTRICT_PATHS[shown].cx}
              y={DISTRICT_PATHS[shown].cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="bnui"
              fontSize="22"
              fontWeight="700"
              fill={dark ? '#FBF7EC' : '#22201C'}
              stroke={dark ? '#0A3627' : '#FBF7EC'}
              strokeWidth="5"
              paintOrder="stroke"
            >
              {DISTRICT_BY_ID[shown].nameBn}
            </text>
          </g>
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
