import { Plus, RotateCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { DIVISIONS } from '../data/divisions';
import { DISTRICTS, DISTRICT_BY_ID } from '../data/districts';
import { CATEGORIES } from '../utils/meta';
import { FoodCard } from '../components/FoodCard';
import { EmptyState, PageHeader, Spinner } from '../components/ui';
import { loadMySubmissions } from '../lib/api';
import type { Submission } from '../types';

const STATUS_LABEL = { pending: 'Waiting for review', approved: 'Live', rejected: 'Not accepted' } as const;

export default function Community() {
  const { community, communityState, reloadCommunity, firebaseEnabled, user } = useApp();
  const [q, setQ] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('');
  const [mine, setMine] = useState<Submission[] | null>(null);

  useEffect(() => {
    if (!user) return;
    loadMySubmissions(user.uid)
      .then(setMine)
      .catch(() => setMine([]));
  }, [user]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return community.filter((f) => {
      const d = DISTRICT_BY_ID[f.districtId];
      const hay = `${f.nameEn} ${f.nameBn} ${d?.nameEn} ${d?.nameBn}`.toLowerCase();
      return (!s || hay.includes(s)) && (!division || f.divisionId === division) && (!district || f.districtId === district) && (!category || f.category === category);
    });
  }, [community, q, division, district, category]);

  return (
    <div>
      <PageHeader title="Community foods" titleBn="সবার যোগ করা খাবার">
        Local specialties added by visitors and approved by a moderator. They are labelled Community, not Verified, and they don’t count toward the 64-district
        challenge.
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/add" className="btn-chili">
          <Plus className="h-4 w-4" /> Add a food
        </Link>
        {firebaseEnabled && communityState === 'ready' && (
          <p className="text-ink-soft">
            {community.length} approved {community.length === 1 ? 'contribution' : 'contributions'}
          </p>
        )}
      </div>

      {mine && mine.length > 0 && (
        <section className="mb-10 rounded-3xl bg-paper-hi p-5">
          <h2 className="mb-3 text-lg font-bold">Your submissions</h2>
          <ul className="divide-y divide-ink/10">
            {mine.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  <span className="font-semibold">{m.nameEn}</span> <span className="bnui text-ink-soft">{m.nameBn}</span>
                  <span className="block text-sm text-ink-soft">{DISTRICT_BY_ID[m.districtId]?.nameEn}</span>
                  {m.status === 'rejected' && m.reviewNote && <span className="block text-sm text-chili">Moderator note: {m.reviewNote}</span>}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    m.status === 'approved' ? 'bg-paddy-soft text-paddy' : m.status === 'pending' ? 'bg-turmeric-soft text-[#6B4A06]' : 'bg-chili-soft text-chili'
                  }`}
                >
                  {STATUS_LABEL[m.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <label className="flex items-center gap-2 rounded-xl border border-ink/20 bg-paper-hi px-3 focus-within:border-paddy sm:col-span-4 lg:col-span-1">
          <Search className="h-4 w-4 text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search community foods" className="min-h-12 w-full bg-transparent outline-none" />
        </label>
        <select className="field" value={division} onChange={(e) => (setDivision(e.target.value), setDistrict(''))} aria-label="Division">
          <option value="">All divisions</option>
          {DIVISIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nameEn}
            </option>
          ))}
        </select>
        <select className="field" value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="District">
          <option value="">All districts</option>
          {DISTRICTS.filter((d) => !division || d.divisionId === division).map((d) => (
            <option key={d.id} value={d.id}>
              {d.nameEn}
            </option>
          ))}
        </select>
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {!firebaseEnabled ? (
        <EmptyState title="Community foods aren’t connected yet">The site owner needs to add Firebase settings. Browsing the 64-district guide still works.</EmptyState>
      ) : communityState === 'loading' ? (
        <p className="flex items-center gap-2 text-ink-soft">
          <Spinner /> Loading community foods…
        </p>
      ) : communityState === 'error' ? (
        <EmptyState
          title="Couldn’t load community foods"
          action={
            <button className="btn-ghost" onClick={reloadCommunity}>
              <RotateCw className="h-4 w-4" /> Retry
            </button>
          }
        >
          Check your connection. If the free daily database limit was reached, it resets within a day.
        </EmptyState>
      ) : list.length === 0 ? (
        <EmptyState title={community.length ? 'No community food matches these filters' : 'No community foods yet'} action={<Link to="/add" className="btn-primary">Add the first one</Link>}>
          Your local favourite could be the first.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((f) => (
            <FoodCard key={f.id} food={f} />
          ))}
        </div>
      )}
    </div>
  );
}
