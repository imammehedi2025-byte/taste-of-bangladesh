import { Check, LogIn, LogOut, Pencil, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { computeJourney, TOTAL_DISTRICTS, SITE_URL } from '../utils/meta';
import { StampGrid } from '../components/StampGrid';
import { FoodCard } from '../components/FoodCard';
import { EmptyState, Spinner } from '../components/ui';
import { ShareSheet } from '../features/passport/ShareSheet';
import { drawPassport } from '../features/passport/cards';
import { cleanText } from '../utils/text';

export default function Passport() {
  const { progress, community, nickname, setNickname, user, firebaseEnabled, linkGoogle, signOut } = useApp();
  const j = useMemo(() => computeJourney(progress, community), [progress, community]);
  const [editing, setEditing] = useState(false);
  const [nick, setNick] = useState(nickname);
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [tab, setTab] = useState<'tried' | 'want'>('tried');
  const n = j.exploredDistricts.size;
  const pct = Math.round((n / TOTAL_DISTRICTS) * 100);

  return (
    <div className="pt-6">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-paddy p-5 text-paper-hi sm:p-9">
        <div className="stitch pointer-events-none absolute inset-3 rounded-[1.4rem] text-turmeric/45" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="text-paper-hi/75">Food Passport</p>
            {editing ? (
              <form
                className="mt-1 flex gap-2"
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
                  placeholder="Your nickname"
                  aria-label="Nickname"
                />
                <button className="btn min-h-12 bg-turmeric px-4 text-ink" disabled={saving}>
                  {saving ? <Spinner /> : <Check className="h-4 w-4" />} Save
                </button>
              </form>
            ) : (
              <button className="group mt-1 flex items-center gap-2 text-left" onClick={() => (setNick(nickname), setEditing(true))}>
                <span className="text-4xl font-bold sm:text-5xl" style={{ fontVariationSettings: '"wdth" 80' }}>
                  {nickname || 'Add a nickname'}
                </span>
                <Pencil className="h-5 w-5 text-paper-hi/60 group-hover:text-turmeric" aria-label="Edit nickname" />
              </button>
            )}
            <p className="bn mt-3 text-2xl text-turmeric">{j.title.bn}</p>
            <p className="text-paper-hi/80">{j.title.en}</p>

            <div className="mt-7">
              <p className="text-5xl font-bold" style={{ fontVariationSettings: '"wdth" 80' }}>
                {n}
                <span className="text-2xl text-paper-hi/70">/{TOTAL_DISTRICTS}</span>
              </p>
              <p className="text-paper-hi/80">districts explored</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-paper-hi/15" role="progressbar" aria-valuenow={n} aria-valuemin={0} aria-valuemax={64} aria-label="Districts explored">
                <div className="h-full rounded-full bg-turmeric transition-[width] duration-700" style={{ width: `${Math.max(pct, n ? 3 : 0)}%` }} />
              </div>
              {j.title.next && (
                <p className="mt-2 text-sm text-paper-hi/75">
                  {j.title.next.at - n} more district{j.title.next.at - n === 1 ? '' : 's'} to become {j.title.next.en}.
                </p>
              )}
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                [j.triedFoods.length, 'foods tried'],
                [j.wantFoods.length, 'want to try'],
                [j.communityTried, 'community foods tried'],
              ].map(([v, l]) => (
                <div key={l as string} className="rounded-2xl bg-paper-hi/10 px-2 py-3">
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-2xl font-bold">{v}</dd>
                  <dd className="text-xs leading-tight text-paper-hi/75">{l}</dd>
                </div>
              ))}
            </dl>
            <button className="btn mt-6 w-full bg-turmeric text-ink hover:bg-[#f0b53a] sm:w-auto" onClick={() => setShareOpen(true)}>
              <Share2 className="h-4 w-4" /> {n > 0 ? 'Share my Food Passport' : 'Preview my passport card'}
            </button>
          </div>
          <div className="rounded-2xl bg-paddy-deep/50 p-4 sm:p-5">
            <StampGrid explored={j.exploredDistricts} />
          </div>
        </div>
      </section>

      {n > 0 && (
        <p className="mt-4 rounded-2xl bg-turmeric-soft px-4 py-3 text-sm">
          Your Food Passport is ready to share. Challenge friends to beat {n} district{n === 1 ? '' : 's'}.
        </p>
      )}

      <p className="mt-4 text-sm text-ink-soft">
        A district is stamped when you mark at least one of its researched foods as Tried. Community-added foods are counted separately and never change the 64-district
        score.
      </p>

      <section className="mt-10">
        <div className="mb-5 flex gap-2" role="tablist">
          {(['tried', 'want'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2.5 font-semibold ${tab === t ? 'bg-ink text-paper-hi' : 'bg-paper-hi text-ink-soft'}`}
            >
              {t === 'tried' ? `Tried (${j.triedFoods.length})` : `Want to try (${j.wantFoods.length})`}
            </button>
          ))}
        </div>
        {(tab === 'tried' ? j.triedFoods : j.wantFoods).length === 0 ? (
          <EmptyState title={tab === 'tried' ? 'No tasted foods yet' : 'Your list is empty'} action={<Link className="btn-primary" to="/districts">Pick a district</Link>}>
            {tab === 'tried' ? 'Mark a food you have eaten as Tried to earn your first stamp.' : 'Tap Want to try on anything you’d like to taste next.'}
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
        <h2 className="text-lg font-bold">Where your passport is saved</h2>
        {!firebaseEnabled ? (
          <p className="mt-1 text-ink-soft">
            The site isn’t connected to its database yet, so your progress is saved <strong>on this device only</strong>. Clearing browser data will erase it.
          </p>
        ) : !user ? (
          <p className="mt-1 text-ink-soft">Nothing saved yet. Your passport starts the moment you mark your first food — no sign-up needed.</p>
        ) : user.isAnonymous ? (
          <>
            <p className="mt-1 text-ink-soft">
              Saved to our database under a private guest ID kept in this browser. If you clear browser data or switch devices, the guest ID is lost and so is access to
              this passport. Connect a Google account to keep it and use it on any device.
            </p>
            <button className="btn-ghost mt-4" onClick={linkGoogle}>
              <LogIn className="h-4 w-4" /> Keep my passport with Google
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 text-ink-soft">
              Saved to your Google account ({user.email ?? 'connected'}). Sign in with the same account on any device to see it.
            </p>
            <button className="btn-ghost mt-4" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out on this device
            </button>
          </>
        )}
      </section>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Your Food Passport"
        fileName="my-food-passport.png"
        shareText={`I’ve tasted ${n} of Bangladesh’s 64 districts. How many have you tasted?`}
        shareUrl={SITE_URL}
        make={() =>
          drawPassport({
            nickname,
            explored: j.exploredDistricts,
            triedCount: j.triedFoods.length,
            titleEn: j.title.en,
            titleBn: j.title.bn,
            highlights: j.triedFoods.slice(-3).reverse(),
          })
        }
      />
    </div>
  );
}
