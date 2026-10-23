import { Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FOODS } from '../data/foods';
import { DISTRICTS, DISTRICT_BY_ID } from '../data/districts';
import { DIVISIONS, DIVISION_BY_ID } from '../data/divisions';
import { useApp } from '../hooks/useApp';
import { CATEGORIES, avgRating } from '../utils/meta';
import { FoodCard } from '../components/FoodCard';
import { EmptyState, PageHeader, Spinner } from '../components/ui';
import type { Food } from '../types';

const PAGE = 24;

function matches(f: Food, q: string) {
  if (!q) return true;
  const d = DISTRICT_BY_ID[f.districtId];
  const div = DIVISION_BY_ID[f.divisionId];
  const hay = [f.nameEn, f.nameBn, ...(f.alt ?? []), f.description, f.locality ?? '', d?.nameEn, d?.nameBn, ...(d?.alt ?? []), div?.nameEn, div?.nameBn]
    .join(' ')
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((t) => hay.includes(t));
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const { stats, statsState, community, firebaseEnabled } = useApp();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [debounced, setDebounced] = useState(q);
  const [shown, setShown] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const division = params.get('division') ?? '';
  const district = params.get('district') ?? '';
  const category = params.get('category') ?? '';
  const status = params.get('status') ?? '';
  const sort = params.get('sort') ?? 'evidence';
  const mustTry = params.get('view') === 'must-try';

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 220);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    setShown(PAGE);
  }, [debounced, division, district, category, status, sort, mustTry]);

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    if (k === 'division') n.delete('district');
    setParams(n, { replace: true });
  };

  const all = useMemo(() => [...FOODS, ...community], [community]);
  const list = useMemo(() => {
    let r = all.filter(
      (f) =>
        matches(f, debounced) &&
        (!division || f.divisionId === division) &&
        (!district || f.districtId === district) &&
        (!category || f.category === category) &&
        (!status || f.status === status),
    );
    if (mustTry) r = r.filter((f) => (stats[f.id]?.mustTryCount ?? 0) > 0).sort((a, b) => stats[b.id].mustTryCount - stats[a.id].mustTryCount);
    else if (sort === 'rating')
      r = [...r].sort((a, b) => {
        const sa = stats[a.id];
        const sb = stats[b.id];
        return avgRating(sb?.ratingSum ?? 0, sb?.ratingCount ?? 0) - avgRating(sa?.ratingSum ?? 0, sa?.ratingCount ?? 0) || (sb?.ratingCount ?? 0) - (sa?.ratingCount ?? 0);
      });
    else if (sort === 'name') r = [...r].sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    else {
      const rank = (f: Food) => (f.evidenceLevel === 'gi' ? 0 : f.status === 'Verified' ? 1 : f.community ? 2 : 3);
      r = [...r].sort((a, b) => rank(a) - rank(b) || a.nameEn.localeCompare(b.nameEn));
    }
    return r;
  }, [all, debounced, division, district, category, status, sort, mustTry, stats]);

  const activeFilters = [division, district, category, status].filter(Boolean).length;
  const districtOptions = division ? DISTRICTS.filter((d) => d.divisionId === division) : DISTRICTS;

  return (
    <div>
      <PageHeader title="Explore foods" titleBn="খুঁজে দেখুন">
        {all.length} foods from all 64 districts. Search in English or Bangla.
      </PageHeader>

      <div className="sticky top-16 z-20 -mx-4 mb-6 bg-paper/95 px-4 pt-1 pb-3 backdrop-blur">
        <div className="flex gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-ink/20 bg-paper-hi px-4 focus-within:border-paddy">
            <Search className="h-5 w-5 shrink-0 text-ink-soft" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                set('q', e.target.value);
              }}
              placeholder="Food, district or division"
              className="min-h-12 w-full bg-transparent outline-none"
              aria-label="Search"
            />
            {q && (
              <button onClick={() => (setQ(''), set('q', ''))} aria-label="Clear search" className="rounded-full p-1 hover:bg-ink/10">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <button className={`btn-ghost px-4 ${filtersOpen ? 'border-paddy' : ''}`} onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && <span className="rounded-full bg-paddy px-1.5 text-xs text-paper-hi">{activeFilters}</span>}
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${!mustTry ? 'bg-ink text-paper-hi' : 'bg-paper-hi text-ink'}`}
            onClick={() => set('view', '')}
          >
            All foods
          </button>
          <button
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold ${mustTry ? 'bg-chili text-white' : 'bg-paper-hi text-chili'}`}
            onClick={() => set('view', mustTry ? '' : 'must-try')}
          >
            <Heart className="h-4 w-4" /> Must try picks
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => set('category', category === c.id ? '' : c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${category === c.id ? 'bg-paddy text-paper-hi' : 'bg-paper-hi text-ink-soft hover:text-ink'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {filtersOpen && (
          <div className="mt-3 grid gap-3 rounded-2xl bg-paper-hi p-4 sm:grid-cols-4">
            <label>
              <span className="label">Division</span>
              <select className="field" value={division} onChange={(e) => set('division', e.target.value)}>
                <option value="">All divisions</option>
                {DIVISIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameEn} · {d.nameBn}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">District</span>
              <select className="field" value={district} onChange={(e) => set('district', e.target.value)}>
                <option value="">All districts</option>
                {districtOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameEn} · {d.nameBn}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Evidence</span>
              <select className="field" value={status} onChange={(e) => set('status', e.target.value)}>
                <option value="">Any status</option>
                <option value="Verified">Verified</option>
                <option value="Needs Review">Needs review</option>
                <option value="Community Contributed">Community contributed</option>
              </select>
            </label>
            <label>
              <span className="label">Sort by</span>
              <select className="field" value={sort} onChange={(e) => set('sort', e.target.value)} disabled={mustTry}>
                <option value="evidence">Best evidence first</option>
                <option value="name">Name (A–Z)</option>
                <option value="rating" disabled={!firebaseEnabled}>
                  Community rating
                </option>
              </select>
            </label>
            {activeFilters > 0 && (
              <button
                className="text-left text-sm font-semibold text-chili sm:col-span-4"
                onClick={() => setParams(q ? { q } : {}, { replace: true })}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mb-4 text-sm text-ink-soft" aria-live="polite">
        {list.length} {list.length === 1 ? 'food' : 'foods'}
        {mustTry && statsState === 'loading' && (
          <span className="ml-2 inline-flex items-center gap-1">
            <Spinner className="h-3.5 w-3.5" /> loading counts
          </span>
        )}
      </p>

      {mustTry && !firebaseEnabled ? (
        <EmptyState title="Must try picks need the community database">Once the site is connected, recommendations from everyone appear here.</EmptyState>
      ) : list.length === 0 ? (
        <EmptyState
          title={mustTry ? 'No recommendations match yet' : 'Nothing matches that search'}
          action={
            <Link to="/add" className="btn-primary">
              Add this food
            </Link>
          }
        >
          Try a different spelling, or add the food yourself.
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.slice(0, shown).map((f) => (
              <FoodCard key={f.id} food={f} />
            ))}
          </div>
          {shown < list.length && (
            <button className="btn-ghost mx-auto mt-10 flex" onClick={() => setShown((s) => s + PAGE)}>
              Show more ({list.length - shown} left)
            </button>
          )}
        </>
      )}
    </div>
  );
}
