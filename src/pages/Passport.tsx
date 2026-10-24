import { Check, LogIn, LogOut, MousePointerClick, Pencil, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { achievementBn, computeJourney, districtPins, TOTAL_DISTRICTS, SITE_URL, wantDistricts } from '../utils/meta';
import { TasteMap, MapLegend, NamesToggle } from '../components/TasteMap';
import { DistrictSheet } from '../components/DistrictSheet';
import { FoodCard } from '../components/FoodCard';
import { EmptyState, Spinner } from '../components/ui';
import { ShareSheet } from '../features/passport/ShareSheet';
import { drawPassport } from '../features/passport/cards';
import { cleanText, toBnDigits } from '../utils/text';
import { DIVISIONS } from '../data/divisions';
import { DISTRICTS } from '../data/districts';

export default function Passport() {
  const { progress, community, nickname, setNickname, user, firebaseEnabled, linkGoogle, signOut } = useApp();
  const j = useMemo(() => computeJourney(progress, community), [progress, community]);
  const want = useMemo(() => wantDistricts(progress, j.exploredDistricts), [progress, j.exploredDistricts]);
  const [editing, setEditing] = useState(false);
  const [nick, setNick] = useState(nickname);
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [allNames, setAllNames] = useState(false);
  const pins = useMemo(() => districtPins(j.triedFoods), [j.triedFoods]);
  const [tab, setTab] = useState<'tried' | 'want'>('tried');
  const n = j.exploredDistricts.size;
  const pct = Math.round((n / TOTAL_DISTRICTS) * 100);
  const left = j.title.next ? j.title.next.at - n : 0;

  return (
    <div className="pt-6">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-paddy text-paper-hi">
        <div className="grid gap-4 p-5 sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:grid-rows-[auto_1fr] lg:gap-x-10">
          {/* ── A: the plain-language score ── */}
          <div className="flex flex-col lg:col-start-1 lg:row-start-1">
            <div className="flex items-center justify-between gap-3">
              <p className="bnui text-paper-hi/75">আমার স্বাদের ম্যাপ</p>
              <span className="bnui rounded-full bg-turmeric px-3 py-1 text-sm font-semibold text-ink">{j.title.bn}</span>
            </div>

            {editing ? (
              <form
                className="mt-2 flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  const ok = await setNickname(cleanText(nick).slice(0, 30));
                  setSaving(false);
                  if (ok) setEditing(false);
                }}
              >
                <input
                  autoFocus
                  value={nick}
                  maxLength={30}
                  onChange={(e) => setNick(e.target.value)}
                  className="min-h-12 w-full rounded-xl bg-paper-hi px-4 text-lg text-ink outline-none"
                  placeholder="আপনার নাম"
                  aria-label="Nickname"
                />
                <button className="btn min-h-12 bg-turmeric px-4 text-ink" disabled={saving}>
                  {saving ? <Spinner /> : <Check className="h-4 w-4" />} Save
                </button>
              </form>
            ) : (
              <button className="group mt-1 flex items-center gap-2 text-left" onClick={() => (setNick(nickname), setEditing(true))}>
                <span className="text-2xl font-bold sm:text-3xl">{nickname || 'আপনার নাম দিন'}</span>
                <Pencil className="h-4 w-4 text-paper-hi/60 group-hover:text-turmeric" aria-label="Edit name" />
              </button>
            )}

            <p className="bn mt-4 text-lg text-paper-hi/85 sm:text-2xl">আমি বাংলাদেশের</p>
            <div className="flex items-center gap-3">
              <span className="bn text-[5rem] leading-[1.05] font-bold text-paper-hi sm:text-[7rem]">{toBnDigits(n)}</span>
              <span className="bn leading-tight">
                <span className="block text-2xl text-paper-hi/70 sm:text-4xl">/ {toBnDigits(TOTAL_DISTRICTS)} জেলার</span>
                <span className="block text-xl text-paper-hi/90 sm:text-2xl">স্বাদ নিয়েছি</span>
              </span>
            </div>
          </div>

          {/* ── B: the map you fill by tapping ── */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <p className="bnui mb-2 flex items-center gap-2 rounded-xl bg-paper-hi/10 px-3 py-2 text-sm">
              <MousePointerClick className="h-4 w-4 shrink-0 text-turmeric" />
              যে জেলার খাবার খেয়েছেন, সেখানে চাপ দিন
            </p>
            <TasteMap
              tasted={j.exploredDistricts}
              want={want}
              pins={pins}
              showAllNames={allNames}
              tone="dark"
              selected={selected}
              onSelect={setSelected}
              className="mx-auto max-w-[480px]"
            />
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <MapLegend tone="dark" />
              <NamesToggle on={allNames} onChange={setAllNames} />
            </div>
          </div>

          {/* ── C: progress and share ── */}
          <div className="lg:col-start-1 lg:row-start-2">
            <div>
              <div className="flex justify-between text-sm text-paper-hi/80">
                <span className="bnui">বাংলাদেশের {toBnDigits(pct)}%</span>
                <span className="bnui">{toBnDigits(j.triedFoods.length)}টি খাবার</span>
              </div>
              <div
                className="mt-1.5 h-3 overflow-hidden rounded-full bg-paper-hi/15"
                role="progressbar"
                aria-valuenow={n}
                aria-valuemin={0}
                aria-valuemax={64}
                aria-label="Districts tasted"
              >
                <div className="h-full rounded-full bg-chili transition-[width] duration-700" style={{ width: `${Math.max(pct, n ? 3 : 0)}%` }} />
              </div>
              {j.title.next && (
                <p className="bnui mt-2 text-sm text-paper-hi/80">
                  আর {toBnDigits(left)}টি জেলা হলেই আপনি “{achievementBn(j.title.next)}”
                </p>
              )}
            </div>

            <button className="btn mt-6 hidden bg-turmeric text-ink hover:bg-[#f0b53a] lg:inline-flex" onClick={() => setShareOpen(true)}>
              <Share2 className="h-4 w-4" /> <span className="bnui">আমার ম্যাপ শেয়ার করি</span>
            </button>
          </div>
        </div>
        <div className="border-t border-paper-hi/10 p-4 lg:hidden">
          <button className="btn w-full bg-turmeric text-ink" onClick={() => setShareOpen(true)}>
            <Share2 className="h-4 w-4" /> <span className="bnui">আমার ম্যাপ শেয়ার করি</span>
          </button>
        </div>
      </section>

      {/* Division progress — eight short bars, easier to read than 64 dots */}
      <section className="mt-8 rounded-3xl bg-paper-hi p-5 sm:p-6">
        <h2 className="bnui mb-4 text-lg font-bold">বিভাগ অনুযায়ী</h2>
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {DIVISIONS.map((div) => {
            const list = DISTRICTS.filter((d) => d.divisionId === div.id);
            const done = list.filter((d) => j.exploredDistricts.has(d.id)).length;
            return (
              <li key={div.id}>
                <div className="bnui flex justify-between text-sm">
                  <span className="font-semibold">{div.nameBn}</span>
                  <span className="text-ink-soft">
                    {toBnDigits(done)}/{toBnDigits(list.length)}
                    {done === list.length && ' ✓'}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/8">
                  <div className="h-full rounded-full bg-chili" style={{ width: `${(done / list.length) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-ink-soft">
          একটা জেলার যেকোনো একটি খাবার “খেয়েছি” করলে সেই জেলা রঙিন হয়। কমিউনিটির যোগ করা খাবার আলাদা হিসাব হয়, ৬৪ জেলার স্কোরে গোনা হয় না।
        </p>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex gap-2" role="tablist">
          {(['tried', 'want'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`bnui rounded-full px-5 py-2.5 font-semibold ${tab === t ? 'bg-ink text-paper-hi' : 'bg-paper-hi text-ink-soft'}`}
            >
              {t === 'tried' ? `খেয়েছি (${toBnDigits(j.triedFoods.length)})` : `খেতে চাই (${toBnDigits(j.wantFoods.length)})`}
            </button>
          ))}
        </div>
        {(tab === 'tried' ? j.triedFoods : j.wantFoods).length === 0 ? (
          <EmptyState
            title={tab === 'tried' ? 'এখনো কোনো খাবার যোগ করেননি' : 'তালিকা খালি'}
            action={
              <button className="btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                ম্যাপ থেকে শুরু করুন
              </button>
            }
          >
            {tab === 'tried' ? 'উপরের ম্যাপে আপনার জেলায় চাপ দিয়ে শুরু করুন।' : 'যে খাবার চেখে দেখতে চান, সেখানে “খেতে চাই” চাপুন।'}
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(tab === 'tried' ? j.triedFoods : j.wantFoods).map((f) => (
              <FoodCard key={f.id} food={f} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 rounded-3xl bg-paper-hi p-6">
        <h2 className="text-lg font-bold">Where your map is saved</h2>
        {!firebaseEnabled ? (
          <p className="mt-1 text-ink-soft">
            Saved <strong>on this device only</strong>. Clearing browser data will erase it.
          </p>
        ) : !user ? (
          <p className="mt-1 text-ink-soft">Nothing saved yet. Your map starts the moment you mark your first food — no sign-up needed.</p>
        ) : user.isAnonymous ? (
          <>
            <p className="mt-1 text-ink-soft">
              Saved under a private guest ID in this browser. If you clear browser data or switch devices, the guest ID is lost and so is this map. Connect a
              Google account to keep it on any device.
            </p>
            <button className="btn-ghost mt-4" onClick={linkGoogle}>
              <LogIn className="h-4 w-4" /> Keep my map with Google
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 text-ink-soft">Saved to your Google account ({user.email ?? 'connected'}). Sign in with the same account on any device to see it.</p>
            <button className="btn-ghost mt-4" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out on this device
            </button>
          </>
        )}
        <p className="mt-3 text-sm">
          <Link to="/districts" className="text-paddy underline">
            Browse all 64 districts
          </Link>
        </p>
      </section>

      <DistrictSheet districtId={selected} onClose={() => setSelected(null)} />

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="আমার স্বাদের ম্যাপ"
        fileName="my-taste-of-bangladesh.png"
        shareText={`আমি বাংলাদেশের ৬৪ জেলার মধ্যে ${toBnDigits(n)}টি জেলার স্বাদ নিয়েছি। আপনি কয়টার? 🇧🇩`}
        shareUrl={SITE_URL}
        make={() =>
          drawPassport({
            nickname,
            explored: j.exploredDistricts,
            titleBn: j.title.bn,
            tried: j.triedFoods,
          })
        }
      />
    </div>
  );
}
