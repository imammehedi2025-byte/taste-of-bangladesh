import { ArrowLeft, CalendarDays, ExternalLink, Flag, MapPin, Share2, Star } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FOOD_BY_ID, FOODS_BY_DISTRICT } from '../data/foods';
import { DISTRICT_BY_ID } from '../data/districts';
import { DIVISION_BY_ID } from '../data/divisions';
import { SOURCES } from '../data/sources';
import { useApp } from '../hooks/useApp';
import { FoodPlate } from '../components/FoodPlate';
import { FoodCard } from '../components/FoodCard';
import { EmptyState, Modal, Spinner, StatusBadge } from '../components/ui';
import { MustTryButton, ProgressControl, StarRating } from '../features/ratings/Controls';
import { ShareSheet } from '../features/passport/ShareSheet';
import { drawMustTryCard, drawRatingCard } from '../features/passport/cards';
import { CATEGORY_BY_ID, SITE_URL, avgRating } from '../utils/meta';
import { reportFood } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { cleanText } from '../utils/text';

const LEVEL_TEXT = {
  gi: 'Registered on the government’s Geographical Indication list.',
  multi: 'Two or more independent sources agree.',
  single: 'Only one source found so far — local knowledge welcome.',
  conflict: 'Sources disagree about this entry.',
} as const;

export default function FoodDetail() {
  const { id = '' } = useParams();
  const { community, communityState, stats, myRatings, toast, firebaseEnabled } = useApp();
  const food = FOOD_BY_ID[id] ?? community.find((c) => c.id === id);
  const [share, setShare] = useState<null | 'rating' | 'musttry'>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const rateRef = useRef<HTMLDivElement>(null);

  const s = food ? stats[food.id] : undefined;
  const related = useMemo(() => (food ? (FOODS_BY_DISTRICT[food.districtId] ?? []).filter((f) => f.id !== food.id) : []), [food]);

  if (!food) {
    if (id.startsWith('c_') && communityState === 'loading')
      return (
        <p className="flex items-center gap-2 py-16 text-ink-soft">
          <Spinner /> Loading…
        </p>
      );
    return (
      <div className="py-16">
        <EmptyState title="This food isn’t here" action={<Link to="/explore" className="btn-primary">Explore foods</Link>}>
          It may have been removed, or the link is incomplete.
        </EmptyState>
      </div>
    );
  }

  const d = DISTRICT_BY_ID[food.districtId];
  const div = DIVISION_BY_ID[food.divisionId];
  const cat = CATEGORY_BY_ID[food.category];
  const pageUrl = `${SITE_URL}/food/${encodeURIComponent(food.id)}`;
  const avg = s ? avgRating(s.ratingSum, s.ratingCount) : 0;

  return (
    <div className="pt-5">
      <Link to={`/district/${food.districtId}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-paddy">
        <ArrowLeft className="h-4 w-4" /> {d.nameEn}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <FoodPlate food={food} size="lg" />
          <div className="mt-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge food={food} />
              <span className="text-sm text-ink-soft">{cat.label}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontVariationSettings: '"wdth" 85' }}>
              {food.nameEn}
            </h1>
            <p className="bn mt-1 text-2xl text-paddy">{food.nameBn}</p>
            {food.alt && <p className="mt-1 text-sm text-ink-soft">Also called {food.alt.join(', ')}</p>}
            <p className="mt-4 text-lg">{food.description}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-chili" />
                <div>
                  <dt className="sr-only">Where</dt>
                  <dd>
                    <Link to={`/district/${d.id}`} className="font-semibold hover:text-paddy">
                      {d.nameEn} <span className="bnui">({d.nameBn})</span>
                    </Link>
                    , {div.nameEn} Division
                    {food.locality && <span className="block text-ink-soft">{food.locality}</span>}
                  </dd>
                </div>
              </div>
              {food.season && (
                <div className="flex gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-chili" />
                  <div>
                    <dt className="sr-only">Season</dt>
                    <dd>Best in {food.season}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Actions */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl bg-paper-hi p-5">
            <h2 className="mb-3 font-bold">Have you tasted it?</h2>
            <ProgressControl
              foodId={food.id}
              onSaved={(st) => {
                if (st === 'tried') {
                  toast({
                    kind: 'success',
                    text: `Saved as tried.${!food.community ? ` ${d.nameEn} is now red on your map.` : ''} Nice! Want to rate it?`,
                    action: { label: 'Rate it', run: () => rateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) },
                  });
                } else if (st === 'want') toast({ kind: 'success', text: 'Added to your Want to try list.' });
                else toast({ kind: 'info', text: 'Marked as not tried.' });
              }}
            />
            {!firebaseEnabled && <p className="mt-2 text-xs text-ink-soft">Saved on this device only until the site is connected to its database.</p>}
          </section>

          <section ref={rateRef} className="rounded-3xl bg-paper-hi p-5">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 className="font-bold">Your rating</h2>
              {s && s.ratingCount > 0 ? (
                <p className="text-sm text-ink-soft">
                  <Star className="inline h-4 w-4 fill-turmeric text-turmeric" /> Community {avg} from {s.ratingCount}
                </p>
              ) : (
                <p className="text-sm text-ink-soft">No community ratings yet</p>
              )}
            </div>
            {firebaseEnabled ? (
              <StarRating
                foodId={food.id}
                onSaved={() =>
                  toast({ kind: 'success', text: 'Rating saved. Want to share your rating?', action: { label: 'Make card', run: () => setShare('rating') } })
                }
              />
            ) : (
              <p className="text-sm text-ink-soft">Ratings open once the community database is connected.</p>
            )}
            {myRatings[food.id] && (
              <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-paddy hover:underline" onClick={() => setShare('rating')}>
                <Share2 className="h-4 w-4" /> Share my rating card
              </button>
            )}
          </section>

          <section className="rounded-3xl bg-paper-hi p-5">
            <h2 className="mb-1 font-bold">Recommend it</h2>
            <p className="mb-3 text-sm text-ink-soft">A personal tip for friends — not an official award.</p>
            {firebaseEnabled ? (
              <div className="flex flex-wrap items-center gap-3">
                <MustTryButton
                  foodId={food.id}
                  count={s?.mustTryCount ?? 0}
                  onSaved={(on) =>
                    on
                      ? toast({ kind: 'success', text: 'Recommended. Let friends discover this food too.', action: { label: 'Make card', run: () => setShare('musttry') } })
                      : toast({ kind: 'info', text: 'Recommendation removed.' })
                  }
                />
              </div>
            ) : (
              <p className="text-sm text-ink-soft">Recommendations open once the community database is connected.</p>
            )}
          </section>
        </aside>
      </div>

      {/* Evidence */}
      <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-ink/10 p-6">
          <h2 className="text-xl font-bold">Why {d.nameEn}?</h2>
          <p className="mt-2">{food.association}</p>
          <h3 className="mt-5 font-bold">Evidence</h3>
          <p className="text-ink-soft">{LEVEL_TEXT[food.evidenceLevel]}</p>
          <p className="mt-1 text-sm text-ink-soft">{food.evidence}</p>
          {food.notes && !food.community && <p className="mt-3 rounded-xl bg-turmeric-soft px-4 py-3 text-sm">{food.notes}</p>}
          {food.sources.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {food.sources.map((k) => {
                const src = SOURCES[k as keyof typeof SOURCES];
                return (
                  <li key={k}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 font-semibold text-paddy hover:underline">
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {src.title} <span className="font-normal text-ink-soft">— {src.publisher}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
          {food.community && food.notes && (
            <p className="mt-3 text-sm break-all">
              Contributor’s source:{' '}
              <a className="text-paddy underline" href={food.notes} target="_blank" rel="noopener noreferrer nofollow ugc">
                {food.notes}
              </a>
            </p>
          )}
          <button className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-chili" onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4" /> Report a problem with this entry
          </button>
        </div>
        {related.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold">More from {d.nameEn}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {related.slice(0, 2).map((f) => (
                <FoodCard key={f.id} food={f} showProgress={false} />
              ))}
            </div>
          </div>
        )}
      </section>

      <ShareSheet
        open={share === 'rating'}
        onClose={() => setShare(null)}
        title="Your rating card"
        fileName={`${food.id}-rating.png`}
        shareText={`I rated ${food.nameEn} from ${d.nameEn} ${myRatings[food.id] ?? ''}/5 on Taste of Bangladesh.`}
        shareUrl={pageUrl}
        make={() => drawRatingCard(food, d, myRatings[food.id] ?? 0, s && s.ratingCount ? { avg, count: s.ratingCount } : undefined)}
      />
      <ShareSheet
        open={share === 'musttry'}
        onClose={() => setShare(null)}
        title="Must try card"
        fileName={`${food.id}-must-try.png`}
        shareText={`Must try: ${food.nameEn} (${food.nameBn}) from ${d.nameEn}.`}
        shareUrl={pageUrl}
        make={() => drawMustTryCard(food, d)}
      />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} foodId={food.id} />
    </div>
  );
}

const REASONS = [
  ['wrong-district', 'It belongs to a different district'],
  ['wrong-name', 'The name or spelling is wrong'],
  ['not-famous', 'It isn’t really famous here'],
  ['duplicate', 'It’s a duplicate'],
  ['offensive', 'Offensive or spam'],
  ['other', 'Something else'],
] as const;

function ReportModal({ open, onClose, foodId }: { open: boolean; onClose: () => void; foodId: string }) {
  const { toast, firebaseEnabled } = useApp();
  const [reason, setReason] = useState<string>('wrong-district');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Report a problem">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!firebaseEnabled) return setErr('Reports need the community database, which isn’t connected yet.');
          setBusy(true);
          setErr('');
          try {
            await reportFood(foodId, reason, cleanText(note).slice(0, 500));
            toast({ kind: 'success', text: 'Report sent to the moderators. Thank you.' });
            setNote('');
            onClose();
          } catch (e2) {
            setErr(friendlyError(e2));
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset className="space-y-2">
          <legend className="label">What’s wrong?</legend>
          {REASONS.map(([v, l]) => (
            <label key={v} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 ${reason === v ? 'border-paddy bg-paddy-soft' : 'border-ink/15'}`}>
              <input type="radio" name="reason" value={v} checked={reason === v} onChange={() => setReason(v)} className="accent-[#0F4A37]" />
              {l}
            </label>
          ))}
        </fieldset>
        <label className="mt-4 block">
          <span className="label">
            Details <span className="font-normal text-ink-soft">(optional)</span>
          </span>
          <textarea className="field min-h-24" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        {err && <p className="mt-3 text-sm text-chili" role="alert">{err}</p>}
        <button className="btn-primary mt-4 w-full" disabled={busy}>
          {busy && <Spinner />} Send report
        </button>
      </form>
    </Modal>
  );
}
