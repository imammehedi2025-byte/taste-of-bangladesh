import { Link } from 'react-router-dom';
import { DIVISIONS } from '../data/divisions';
import { DISTRICTS } from '../data/districts';
import { firstGrapheme } from '../features/passport/cards';

/**
 * The signature element: one stamp slot per district, grouped by division.
 * Explored districts get an inked, slightly rotated stamp.
 */
export function StampGrid({ explored, tone = 'dark', linkable = true }: { explored: Set<string>; tone?: 'dark' | 'light'; linkable?: boolean }) {
  const dark = tone === 'dark';
  return (
    <div className="flex flex-col gap-3">
      {DIVISIONS.map((div) => {
        const list = DISTRICTS.filter((d) => d.divisionId === div.id);
        const done = list.filter((d) => explored.has(d.id)).length;
        return (
          <div key={div.id} className="grid grid-cols-[5.5rem_1fr] items-center gap-2 sm:grid-cols-[7rem_1fr]">
            <div className={`text-xs leading-tight ${dark ? 'text-paper-hi/75' : 'text-ink-soft'}`}>
              <span className="bnui block text-sm font-semibold">{div.nameBn}</span>
              {done}/{list.length}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {list.map((d) => {
                const on = explored.has(d.id);
                const inner = (
                  <span
                    title={`${d.nameEn}${on ? ' — explored' : ''}`}
                    className={`grid h-8 w-8 place-items-center rounded-full text-[13px] font-bold sm:h-9 sm:w-9 ${
                      on
                        ? 'stamp-in bnui border-2 border-chili bg-chili text-paper-hi shadow-[0_0_0_2px_rgba(196,53,43,0.25)]'
                        : `border-[1.5px] border-dashed ${dark ? 'border-paper-hi/35 text-paper-hi/45' : 'border-ink/25 text-ink/35'} bnui`
                    }`}
                  >
                    {firstGrapheme(d.nameBn)}
                  </span>
                );
                return linkable ? (
                  <Link key={d.id} to={`/district/${d.id}`} aria-label={`${d.nameEn}${on ? ', explored' : ', not explored yet'}`}>
                    {inner}
                  </Link>
                ) : (
                  <span key={d.id}>{inner}</span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
