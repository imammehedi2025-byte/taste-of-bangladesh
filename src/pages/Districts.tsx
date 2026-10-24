import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DISTRICTS, DISTRICT_BY_ID } from '../data/districts';
import { DIVISIONS, DIVISION_BY_ID } from '../data/divisions';
import { FOODS_BY_DISTRICT } from '../data/foods';
import { useApp } from '../hooks/useApp';
import { computeJourney } from '../utils/meta';
import { FoodCard } from '../components/FoodCard';
import { EmptyState, PageHeader } from '../components/ui';

export function DistrictsIndex() {
  const { progress, community } = useApp();
  const { exploredDistricts } = useMemo(() => computeJourney(progress, community), [progress, community]);
  const [q, setQ] = useState('');
  const s = q.trim().toLowerCase();
  const visible = (id: string) => {
    if (!s) return true;
    const d = DISTRICT_BY_ID[id];
    return d.nameEn.toLowerCase().includes(s) || d.nameBn.includes(q.trim()) || d.alt?.some((a) => a.toLowerCase().includes(s));
  };

  return (
    <div>
      <PageHeader title="64 districts" titleBn="৬৪ জেলা">
        Pick a district to see what it is known for. Districts you have tasted are shown in green.
      </PageHeader>
      <label className="mb-8 flex max-w-md items-center gap-2 rounded-full border border-ink/20 bg-paper-hi px-4 focus-within:border-paddy">
        <Search className="h-5 w-5 text-ink-soft" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a district" aria-label="Find a district" className="min-h-12 w-full bg-transparent outline-none" />
      </label>
      <div className="space-y-10">
        {DIVISIONS.map((div) => {
          const list = DISTRICTS.filter((d) => d.divisionId === div.id && visible(d.id));
          if (!list.length) return null;
          return (
            <section key={div.id} aria-labelledby={`div-${div.id}`}>
              <h2 id={`div-${div.id}`} className="mb-3 flex items-baseline gap-3 text-xl font-bold">
                {div.nameEn} Division <span className="bn text-base font-semibold text-chili">{div.nameBn} বিভাগ</span>
              </h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((d) => {
                  const foods = FOODS_BY_DISTRICT[d.id] ?? [];
                  const verified = foods.filter((f) => f.status === 'Verified').length;
                  const on = exploredDistricts.has(d.id);
                  return (
                    <li key={d.id}>
                      <Link
                        to={`/district/${d.id}`}
                        className={`relative flex min-h-24 flex-col justify-between rounded-2xl p-4 transition-colors ${on ? 'bg-paddy text-paper-hi' : 'bg-paper-hi hover:bg-paddy-soft'}`}
                      >
                        <span>
                          <span className="block font-bold">{d.nameEn}</span>
                          <span className={`bn block text-lg ${on ? 'text-turmeric' : 'text-paddy'}`}>{d.nameBn}</span>
                        </span>
                        <span className={`mt-2 text-xs ${on ? 'text-paper-hi/80' : 'text-ink-soft'}`}>
                          {foods.length} food{foods.length === 1 ? '' : 's'} · {verified} verified
                        </span>
                        {on && (
                          <span className="stamp-in absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full border-2 border-turmeric text-[10px] font-bold text-turmeric">
                            ✓
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function DistrictPage() {
  const { id = '' } = useParams();
  const { progress, community, communityState } = useApp();
  const d = DISTRICT_BY_ID[id];
  const explored = useMemo(() => computeJourney(progress, community).exploredDistricts, [progress, community]);
  if (!d)
    return (
      <div className="py-16">
        <EmptyState title="No district by that name" action={<Link className="btn-primary" to="/districts">See all 64 districts</Link>} />
      </div>
    );
  const div = DIVISION_BY_ID[d.divisionId];
  const foods = FOODS_BY_DISTRICT[d.id] ?? [];
  const extra = community.filter((c) => c.districtId === d.id);
  const on = explored.has(d.id);

  return (
    <div>
      <header className="relative mt-6 mb-8 overflow-hidden rounded-[1.75rem] bg-paddy p-6 text-paper-hi sm:p-10">
        <div className="stitch pointer-events-none absolute inset-3 rounded-[1.4rem] text-turmeric/50" />
        <Link to="/districts" className="relative text-sm text-paper-hi/75 hover:text-paper-hi">
          {div.nameEn} Division
        </Link>
        <h1 className="relative mt-1 text-4xl font-bold sm:text-6xl" style={{ fontVariationSettings: '"wdth" 80' }}>
          {d.nameEn}
        </h1>
        <p className="bn relative text-3xl text-turmeric sm:text-4xl">{d.nameBn}</p>
        <p className="relative mt-4 max-w-md text-paper-hi/85">
          {on ? 'Tasted. This district is red on your map.' : 'Mark any food below as Tried and this district turns red on your map.'}
        </p>
        <div
          className={`relative mt-5 grid h-24 w-24 place-items-center rounded-full border-[3px] sm:absolute sm:right-10 sm:bottom-10 sm:mt-0 sm:h-32 sm:w-32 ${
            on ? 'stamp-in border-chili bg-chili text-paper-hi' : 'border-dashed border-paper-hi/40 text-paper-hi/50'
          }`}
          aria-hidden="true"
        >
          <span className="bn text-center text-sm leading-tight whitespace-pre-line sm:text-base">{on ? `${d.nameBn}\nস্বাদ নেওয়া` : d.nameBn}</span>
        </div>
      </header>

      <section>
        <h2 className="mb-1 text-2xl font-bold">Known for</h2>
        <p className="mb-5 text-ink-soft">Researched entries. Each shows how well it is supported.</p>
        <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((f) => (
            <FoodCard key={f.id} food={f} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-1 text-2xl font-bold">From the community</h2>
        <p className="mb-5 text-ink-soft">Added by people who know {d.nameEn}, after review.</p>
        {communityState === 'loading' ? (
          <p className="text-ink-soft">Loading…</p>
        ) : extra.length ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {extra.map((f) => (
              <FoodCard key={f.id} food={f} />
            ))}
          </div>
        ) : (
          <EmptyState title={`Nothing added for ${d.nameEn} yet`}>Know a local specialty that’s missing?</EmptyState>
        )}
        <Link to={`/add?district=${d.id}`} className="btn-chili mt-6">
          <Plus className="h-4 w-4" /> Add a missing food from {d.nameEn}
        </Link>
      </section>
    </div>
  );
}
