import { Heart, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { FOODS } from '../data/foods';
import { DIVISIONS } from '../data/divisions';
import { StampGrid } from '../components/StampGrid';
import { FoodCard } from '../components/FoodCard';
import { computeJourney, TOTAL_DISTRICTS } from '../utils/meta';
import { Spinner } from '../components/ui';

/** Featured: one verified food per division, so the home page spans the whole country. */
// Sylhet has no GI-registered food yet, so its best-supported verified dish stands in.
const OVERRIDE: Record<string, string> = { sylhet: 'moulvibazar--seven-layer-tea' };
const FEATURED = DIVISIONS.map(
  (d) => FOODS.find((f) => f.id === OVERRIDE[d.id]) ?? FOODS.find((f) => f.divisionId === d.id && f.evidenceLevel === 'gi') ?? FOODS.find((f) => f.divisionId === d.id)!,
);

export default function Home() {
  const { progress, community, communityState, stats, statsState, firebaseEnabled } = useApp();
  const journey = useMemo(() => computeJourney(progress, community), [progress, community]);
  const [q, setQ] = useState('');
  const nav = useNavigate();

  const popular = useMemo(
    () =>
      Object.values(stats)
        .filter((s) => s.mustTryCount > 0 || s.ratingCount > 0)
        .sort((a, b) => b.mustTryCount - a.mustTryCount || b.ratingCount - a.ratingCount)
        .map((s) => FOODS.find((f) => f.id === s.foodId) ?? community.find((c) => c.id === s.foodId))
        .filter(Boolean)
        .slice(0, 4),
    [stats, community],
  );

  const n = journey.exploredDistricts.size;

  return (
    <div>
      {/* Hero: the question, and the passport page you will fill */}
      <section className="grid gap-8 pt-8 pb-12 md:grid-cols-[1.05fr_1fr] md:items-center md:pt-14">
        <div>
          <p className="bn mb-3 text-xl text-chili">৬৪ জেলা, ৬৪ স্বাদ</p>
          <h1 className="text-[2.6rem] leading-[1.02] font-bold tracking-tight text-paddy sm:text-6xl" style={{ fontVariationSettings: '"wdth" 80' }}>
            How Much of Bangladesh Have You Tasted?
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink-soft">
            Every district has a food it is famous for. Find them, mark the ones you have eaten, and collect a stamp for each district until your
            passport is full.
          </p>
          <form
            className="mt-6 flex max-w-lg items-center gap-2 rounded-full border border-ink/20 bg-paper-hi p-1.5 pl-4 focus-within:border-paddy"
            onSubmit={(e) => {
              e.preventDefault();
              nav(`/explore?q=${encodeURIComponent(q)}`);
            }}
            role="search"
          >
            <Search className="h-5 w-5 text-ink-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="min-h-11 flex-1 bg-transparent outline-none"
              placeholder="A food or district — রসমালাই, Bogura…"
              aria-label="Search foods or districts"
            />
            <button className="btn-primary min-h-11 px-5">Search</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/districts" className="btn-chili">
              Start your food journey
            </Link>
            <Link to="/passport" className="btn-ghost">
              My passport
            </Link>
          </div>
        </div>

        <Link to="/passport" className="block rounded-[1.75rem] bg-paddy p-5 text-paper-hi shadow-xl sm:p-7" aria-label="Open my Food Passport">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-paper-hi/75">Food Passport</p>
              <p className="text-4xl font-bold" style={{ fontVariationSettings: '"wdth" 80' }}>
                {n} <span className="text-xl font-semibold text-paper-hi/75">of {TOTAL_DISTRICTS} districts explored</span>
              </p>
            </div>
            <span className="bn text-right text-sm text-turmeric">{journey.title.bn}</span>
          </div>
          <div className="stitch-line mb-4 text-turmeric/60" />
          <StampGrid explored={journey.exploredDistricts} linkable={false} />
        </Link>
      </section>

      {/* How it works — a real sequence, so it is numbered */}
      <section className="mb-14 grid gap-4 rounded-3xl bg-paper-hi p-6 sm:grid-cols-3 sm:p-8" aria-label="How it works">
        {[
          ['Find', 'Open a district and see what it is known for, with the sources behind each claim.'],
          ['Mark', 'Tap Tried or Want to try. One tried food from a district earns that district’s stamp.'],
          ['Share', 'Rate, recommend, and download your passport as an image to challenge friends.'],
        ].map(([t, d], i) => (
          <div key={t} className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-dashed border-chili font-bold text-chili">{i + 1}</span>
            <div>
              <h2 className="text-lg font-bold">{t}</h2>
              <p className="text-ink-soft">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">One taste from every division</h2>
            <p className="text-ink-soft">Verified picks, one per division — most are registered Geographical Indications.</p>
          </div>
          <Link to="/explore" className="hidden shrink-0 font-semibold text-paddy underline-offset-4 hover:underline sm:block">
            All {FOODS.length} foods
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((f) => (
            <FoodCard key={f.id} food={f} />
          ))}
        </div>
        <Link to="/explore" className="btn-ghost mt-6 w-full sm:hidden">
          See all {FOODS.length} foods
        </Link>
      </section>

      <section className="mb-14">
        <h2 className="mb-1 text-2xl font-bold sm:text-3xl">Most recommended right now</h2>
        <p className="mb-5 text-ink-soft">Counted from real Must try taps and ratings. Nothing here is made up.</p>
        {!firebaseEnabled ? (
          <p className="rounded-2xl bg-paper-hi p-5 text-ink-soft">Community rankings appear once the site is connected to its database.</p>
        ) : statsState === 'loading' ? (
          <p className="flex items-center gap-2 text-ink-soft">
            <Spinner /> Loading community picks…
          </p>
        ) : popular.length === 0 ? (
          <div className="rounded-2xl bg-paper-hi p-5">
            <p className="font-semibold">No recommendations yet.</p>
            <p className="text-ink-soft">
              Open a food you love and tap <Heart className="inline h-4 w-4 text-chili" /> Must try to be the first.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((f) => (
              <FoodCard key={f!.id} food={f!} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-6 grid gap-6 rounded-3xl bg-turmeric-soft p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Is your district’s food missing?</h2>
          <p className="mt-1 max-w-xl text-ink-soft">
            Add it in under a minute. It appears for everyone after a quick review.
            {communityState === 'ready' && community.length > 0 && ` ${community.length} community food${community.length === 1 ? ' is' : 's are'} live so far.`}
          </p>
          {community.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {community.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link to={`/food/${encodeURIComponent(c.id)}`} className="bnui inline-block rounded-full bg-paper-hi px-3 py-1 text-sm hover:text-paddy">
                    {c.nameBn}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link to="/add" className="btn-primary">
          <Plus className="h-4 w-4" /> Add a missing food
        </Link>
      </section>
    </div>
  );
}
