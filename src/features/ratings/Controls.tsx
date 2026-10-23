import { Bookmark, Check, Heart, Star } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { Spinner } from '../../components/ui';
import type { ProgressState } from '../../types';

const OPTIONS: { value: ProgressState | null; label: string; icon: typeof Check }[] = [
  { value: null, label: 'Not tried', icon: Bookmark },
  { value: 'want', label: 'Want to try', icon: Bookmark },
  { value: 'tried', label: 'Tried', icon: Check },
];

/** Three-way segmented control. Shows a spinner until the database confirms; never pretends. */
export function ProgressControl({ foodId, onSaved, compact }: { foodId: string; onSaved?: (s: ProgressState | null) => void; compact?: boolean }) {
  const { progress, pending, setProgress } = useApp();
  const current = progress[foodId] ?? null;
  const busy = pending.has(`p:${foodId}`);
  const [target, setTarget] = useState<ProgressState | null | undefined>(undefined);

  async function choose(v: ProgressState | null) {
    if (busy || v === current) return;
    setTarget(v);
    const ok = await setProgress(foodId, v);
    setTarget(undefined);
    if (ok) onSaved?.(v);
  }

  return (
    <div role="radiogroup" aria-label="My progress" className={`grid grid-cols-3 rounded-full bg-ink/6 p-1 ${compact ? 'text-xs' : 'text-sm'}`}>
      {OPTIONS.map((o) => {
        const selected = current === o.value;
        const loading = busy && target === o.value;
        const tone =
          selected && o.value === 'tried'
            ? 'bg-paddy text-paper-hi'
            : selected && o.value === 'want'
              ? 'bg-turmeric text-ink'
              : selected
                ? 'bg-paper-hi text-ink shadow-sm'
                : 'text-ink-soft hover:text-ink';
        return (
          <button
            key={o.label}
            role="radio"
            aria-checked={selected}
            disabled={busy}
            onClick={() => choose(o.value)}
            className={`flex items-center justify-center gap-1 rounded-full font-semibold transition-colors ${compact ? 'min-h-9 px-1.5' : 'min-h-11 px-2'} ${tone}`}
          >
            {loading ? <Spinner className="h-3.5 w-3.5" /> : selected && o.value === 'tried' ? <Check className="h-3.5 w-3.5" /> : null}
            <span className="truncate">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function StarRating({ foodId, onSaved }: { foodId: string; onSaved?: (v: number) => void }) {
  const { myRatings, pending, rate } = useApp();
  const saved = myRatings[foodId] ?? 0;
  const busy = pending.has(`r:${foodId}`);
  const [hover, setHover] = useState(0);
  const [chosen, setChosen] = useState(0);
  const shown = hover || chosen || saved;

  async function pick(v: number) {
    if (busy) return;
    setChosen(v);
    const ok = await rate(foodId, v);
    if (ok) {
      setChosen(0);
      onSaved?.(v);
    }
    // on failure the chosen value stays visible and the error toast offers Retry
  }

  return (
    <div>
      <div role="radiogroup" aria-label="My rating" className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            role="radio"
            aria-checked={saved === v}
            aria-label={`${v} star${v > 1 ? 's' : ''}`}
            disabled={busy}
            onMouseEnter={() => setHover(v)}
            onClick={() => pick(v)}
            className="grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-90"
          >
            <Star className={`h-7 w-7 ${v <= shown ? 'fill-turmeric text-turmeric' : 'text-ink/25'}`} strokeWidth={1.75} />
          </button>
        ))}
        <span className="ml-2 text-sm text-ink-soft" aria-live="polite">
          {busy ? (
            <span className="inline-flex items-center gap-1">
              <Spinner className="h-3.5 w-3.5" /> Saving
            </span>
          ) : chosen && chosen !== saved ? (
            'Not saved'
          ) : saved ? (
            `You rated ${saved}/5`
          ) : (
            'Tap to rate'
          )}
        </span>
      </div>
    </div>
  );
}

export function MustTryButton({ foodId, count, onSaved }: { foodId: string; count: number; onSaved?: (on: boolean) => void }) {
  const { myRecs, pending, toggleMustTry } = useApp();
  const on = myRecs.has(foodId);
  const busy = pending.has(`m:${foodId}`);
  return (
    <button
      aria-pressed={on}
      disabled={busy}
      onClick={async () => {
        const ok = await toggleMustTry(foodId);
        if (ok) onSaved?.(!on);
      }}
      className={`btn ${on ? 'bg-chili text-white hover:bg-[#a72a21]' : 'border border-chili/40 bg-paper-hi text-chili hover:border-chili'}`}
    >
      {busy ? <Spinner /> : <Heart className={`h-4 w-4 ${on ? 'fill-white' : ''}`} />}
      {on ? 'You recommend this' : 'Must try'}
      <span className={`rounded-full px-2 text-xs ${on ? 'bg-white/20' : 'bg-chili-soft'}`} aria-label={`${count} recommendations`}>
        {count}
      </span>
    </button>
  );
}
