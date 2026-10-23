import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { DISTRICTS, DISTRICT_BY_ID } from '../data/districts';
import { DIVISION_BY_ID } from '../data/divisions';

/** Searchable district combobox (English or Bangla). Division is derived, never typed. */
export function DistrictPicker({ value, onChange, invalid }: { value: string; onChange: (id: string) => void; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return DISTRICTS;
    return DISTRICTS.filter(
      (d) => d.nameEn.toLowerCase().includes(s) || d.nameBn.includes(q.trim()) || d.alt?.some((a) => a.toLowerCase().includes(s)),
    );
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selected = value ? DISTRICT_BY_ID[value] : undefined;

  function pick(id: string) {
    onChange(id);
    setOpen(false);
    setQ('');
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        className={`field flex items-center justify-between text-left ${invalid ? 'border-chili' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => input.current?.focus(), 0);
        }}
      >
        {selected ? (
          <span>
            {selected.nameEn} <span className="bnui text-ink-soft">· {selected.nameBn}</span>
          </span>
        ) : (
          <span className="text-ink-soft">Choose a district</span>
        )}
        <ChevronDown className="h-4 w-4 text-ink-soft" />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-ink/15 bg-paper-hi shadow-xl">
          <div className="flex items-center gap-2 border-b border-ink/10 px-3">
            <Search className="h-4 w-4 text-ink-soft" />
            <input
              ref={input}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === 'Enter' && results[active]) {
                  e.preventDefault();
                  pick(results[active].id);
                } else if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="Type a district — e.g. Bogura or বগুড়া"
              className="min-h-12 w-full bg-transparent outline-none"
              role="combobox"
              aria-controls={listId}
              aria-expanded
              aria-autocomplete="list"
            />
          </div>
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {results.length === 0 && <li className="px-4 py-3 text-sm text-ink-soft">No district matches “{q}”.</li>}
            {results.map((d, i) => (
              <li
                key={d.id}
                role="option"
                aria-selected={d.id === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(d.id)}
                className={`flex cursor-pointer items-center justify-between px-4 py-2.5 ${i === active ? 'bg-paddy-soft' : ''}`}
              >
                <span>
                  {d.nameEn} <span className="bnui text-ink-soft">{d.nameBn}</span>
                </span>
                <span className="text-xs text-ink-soft">{DIVISION_BY_ID[d.divisionId].nameEn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
