import { Check, ChevronRight, Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DISTRICT_BY_ID } from '../data/districts';
import { DIVISION_BY_ID } from '../data/divisions';
import { FOODS_BY_DISTRICT } from '../data/foods';
import { useApp } from '../hooks/useApp';
import { Modal, Spinner } from './ui';
import { toBnDigits } from '../utils/text';
import { computeJourney } from '../utils/meta';
import type { ProgressState } from '../types';
import { foodEmoji } from '../utils/emoji';

/**
 * Opens when a district is tapped on the map. One tap on a food marks it eaten,
 * and the district turns red on the map straight away.
 */
export function DistrictSheet({ districtId, onClose }: { districtId: string | null; onClose: () => void }) {
  const { progress, pending, setProgress, toast, community } = useApp();
  if (!districtId) return null;
  const d = DISTRICT_BY_ID[districtId];
  const div = DIVISION_BY_ID[d.divisionId];
  const foods = [...(FOODS_BY_DISTRICT[districtId] ?? []), ...community.filter((c) => c.districtId === districtId)];

  async function mark(foodId: string, nameBn: string, next: ProgressState | null, isCommunity: boolean) {
    const wasTasted = computeJourney(progress).exploredDistricts.has(districtId!);
    const ok = await setProgress(foodId, next);
    if (!ok) return;
    if (next === 'tried' && !wasTasted && !isCommunity) {
      const n = computeJourney({ ...progress, [foodId]: 'tried' }).exploredDistricts.size;
      toast({ kind: 'success', text: `${d.nameBn} এখন ম্যাপে লাল! আপনি ৬৪টার মধ্যে ${toBnDigits(n)}টি জেলার স্বাদ নিয়েছেন।` });
      // close so the person sees their district turn red on the map
      setTimeout(onClose, 450);
    } else if (next === 'tried') toast({ kind: 'success', text: `${nameBn} — খেয়েছি তালিকায় যোগ হলো।` });
    else if (next === 'want') toast({ kind: 'success', text: `${nameBn} — খেতে চাই তালিকায় রাখা হলো।` });
  }

  return (
    <Modal open onClose={onClose} title={`${d.nameBn} · ${d.nameEn}`}>
      <p className="-mt-3 mb-4 text-sm text-ink-soft">
        {div.nameBn} বিভাগ · এখানকার কোন খাবার আপনি খেয়েছেন? চাপ দিলেই ম্যাপে জেলাটা রঙিন হবে।
      </p>
      <ul className="space-y-2.5">
        {foods.map((f) => {
          const st = progress[f.id];
          const busy = pending.has(`p:${f.id}`);
          return (
            <li key={f.id} className={`rounded-2xl border p-3 ${st === 'tried' ? 'border-chili/40 bg-chili-soft/60' : 'border-ink/10 bg-paper'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="bn text-lg leading-snug font-bold">
                    <span className="mr-1.5" aria-hidden="true">{foodEmoji(f)}</span>
                    {f.nameBn}
                  </p>
                  <p className="truncate text-sm text-ink-soft">{f.nameEn}</p>
                </div>
                <Link to={`/food/${encodeURIComponent(f.id)}`} onClick={onClose} className="shrink-0 rounded-full p-1.5 text-ink-soft hover:bg-ink/5" aria-label={`About ${f.nameEn}`}>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  disabled={busy}
                  aria-pressed={st === 'tried'}
                  onClick={() => mark(f.id, f.nameBn, st === 'tried' ? null : 'tried', !!f.community)}
                  className={`bnui flex min-h-11 items-center justify-center gap-1.5 rounded-full font-semibold transition-colors ${
                    st === 'tried' ? 'bg-chili text-white' : 'border border-chili/50 bg-paper-hi text-chili hover:border-chili'
                  }`}
                >
                  {busy ? <Spinner /> : <Check className="h-4 w-4" />} {st === 'tried' ? 'খেয়েছি ✓' : 'খেয়েছি'}
                </button>
                <button
                  disabled={busy}
                  aria-pressed={st === 'want'}
                  onClick={() => mark(f.id, f.nameBn, st === 'want' ? null : 'want', !!f.community)}
                  className={`bnui flex min-h-11 items-center justify-center gap-1.5 rounded-full font-semibold transition-colors ${
                    st === 'want' ? 'bg-turmeric text-ink' : 'border border-ink/15 bg-paper-hi text-ink-soft hover:text-ink'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${st === 'want' ? 'fill-ink' : ''}`} /> খেতে চাই
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link to={`/district/${districtId}`} onClick={onClose} className="btn-ghost min-h-10 px-4">
          {d.nameEn} সম্পর্কে বিস্তারিত
        </Link>
        <Link to={`/add?district=${districtId}`} onClick={onClose} className="btn-ghost min-h-10 px-4">
          <Plus className="h-4 w-4" /> খাবার যোগ করুন
        </Link>
      </div>
    </Modal>
  );
}
