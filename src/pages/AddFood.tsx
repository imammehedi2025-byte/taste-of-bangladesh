import { AlertTriangle, Check, Share2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DISTRICT_BY_ID } from '../data/districts';
import { DIVISION_BY_ID } from '../data/divisions';
import { FOODS } from '../data/foods';
import { useApp } from '../hooks/useApp';
import { DistrictPicker } from '../components/DistrictPicker';
import { PageHeader, Spinner } from '../components/ui';
import { CATEGORIES } from '../utils/meta';
import { cleanText, isSafeUrl, normalizeName, similar } from '../utils/text';
import { submitFood } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { ShareSheet } from '../features/passport/ShareSheet';
import { drawContributionCard } from '../features/passport/cards';
import type { FoodCategory } from '../types';
import { SITE_URL } from '../utils/meta';

interface Draft {
  nameEn: string;
  nameBn: string;
  districtId: string;
  category: FoodCategory | '';
  description: string;
  association: string;
  sourceUrl: string;
}
const EMPTY: Draft = { nameEn: '', nameBn: '', districtId: '', category: '', description: '', association: '', sourceUrl: '' };
const KEY = 'tob.addDraft.v1';

export default function AddFood() {
  const [params] = useSearchParams();
  const { firebaseEnabled, community } = useApp();
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null') as Draft | null;
      return { ...EMPTY, ...saved, districtId: params.get('district') || saved?.districtId || '' };
    } catch {
      return { ...EMPTY, districtId: params.get('district') || '' };
    }
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<null | Draft>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Keep the draft through navigation and recoverable errors.
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const district = draft.districtId ? DISTRICT_BY_ID[draft.districtId] : undefined;
  const division = district ? DIVISION_BY_ID[district.divisionId] : undefined;

  const errs = {
    nameEn: cleanText(draft.nameEn).length < 2 ? 'Enter the food’s name (at least 2 letters).' : cleanText(draft.nameEn).length > 60 ? 'Keep the name under 60 characters.' : '',
    nameBn: draft.nameBn.length > 60 ? 'Keep the Bangla name under 60 characters.' : '',
    districtId: !draft.districtId ? 'Choose the district it belongs to.' : '',
    category: !draft.category ? 'Pick the closest category.' : '',
    description: cleanText(draft.description).length < 10 ? 'Describe it in a sentence (at least 10 characters).' : '',
    association: cleanText(draft.association).length < 10 ? 'Say why it belongs to this district (at least 10 characters).' : '',
    sourceUrl: !isSafeUrl(draft.sourceUrl.trim()) ? 'Use a full web address starting with https://' : '',
  };
  const step1Ok = !errs.nameEn && !errs.nameBn && !errs.districtId && !errs.category;
  const step2Ok = !errs.description && !errs.association && !errs.sourceUrl;

  // Duplicate detection against the researched list and approved community foods.
  const dupes = useMemo(() => {
    const slugEn = normalizeName(draft.nameEn);
    const slugBn = normalizeName(draft.nameBn);
    if (slugEn.length < 3 && slugBn.length < 2) return { same: [], elsewhere: [] };
    const all = [...FOODS, ...community];
    const hit = all.filter((f) => {
      const fe = normalizeName(f.nameEn);
      const fb = normalizeName(f.nameBn);
      return (slugEn.length >= 3 && (similar(slugEn, fe) || (f.alt ?? []).some((a) => similar(slugEn, normalizeName(a))))) || (slugBn.length >= 2 && similar(slugBn, fb));
    });
    return { same: hit.filter((f) => f.districtId === draft.districtId), elsewhere: hit.filter((f) => f.districtId !== draft.districtId).slice(0, 3) };
  }, [draft.nameEn, draft.nameBn, draft.districtId, community]);

  const showErr = (k: keyof typeof errs) => (touched[k] && errs[k] ? errs[k] : '');

  async function submit() {
    setTouched({ nameEn: true, nameBn: true, districtId: true, category: true, description: true, association: true, sourceUrl: true });
    if (!step1Ok) return setStep(1);
    if (!step2Ok || busy || !district) return;
    if (!firebaseEnabled) return setError(friendlyError(new Error('not-configured')));
    setBusy(true);
    setError('');
    const nameEn = cleanText(draft.nameEn);
    try {
      await submitFood({
        nameEn,
        nameBn: cleanText(draft.nameBn),
        districtId: district.id,
        divisionId: district.divisionId,
        category: draft.category as FoodCategory,
        description: cleanText(draft.description),
        association: cleanText(draft.association),
        sourceUrl: draft.sourceUrl.trim(),
        normalizedName: normalizeName(draft.nameEn),
      });
      setDone(draft);
      setDraft({ ...EMPTY });
      sessionStorage.removeItem(KEY);
      setStep(1);
      setTouched({});
    } catch (e) {
      setError(friendlyError(e)); // draft is kept
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const d = DISTRICT_BY_ID[done.districtId];
    return (
      <div className="mx-auto max-w-xl py-10">
        <div className="rounded-[1.75rem] bg-paddy p-7 text-paper-hi">
          <span className="stamp-in mb-4 grid h-14 w-14 place-items-center rounded-full border-[3px] border-turmeric text-turmeric">
            <Check className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-bold">Thanks for contributing to Bangladesh’s food culture.</h1>
          <p className="mt-3 text-paper-hi/85">
            <strong>{done.nameEn}</strong> from {d.nameEn} is <strong>waiting for review</strong>. It appears for everyone once a moderator approves it. You can
            follow its status on the Community page.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button className="btn-chili" onClick={() => setShareOpen(true)}>
            <Share2 className="h-4 w-4" /> Make a contribution card
          </button>
          <Link to={`/district/${d.id}`} className="btn-ghost">
            Back to {d.nameEn}
          </Link>
          <Link to="/explore" className="btn-ghost">
            Keep exploring
          </Link>
          <button className="btn-ghost" onClick={() => setDone(null)}>
            Add another food
          </button>
        </div>
        <ShareSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          title="Contribution card"
          fileName={`taste-of-bd-contribution.png`}
          shareText={`I added ${done.nameEn} from ${d.nameEn} to Taste of Bangladesh. Which food is your district famous for?`}
          shareUrl={`${SITE_URL}/district/${d.id}`}
          make={() => drawContributionCard({ nameEn: cleanText(done.nameEn), nameBn: cleanText(done.nameBn), district: d, statusLabel: 'Submitted · pending review' })}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add a missing food" titleBn="হারানো স্বাদ যোগ করুন">
        Two short steps. No account needed. A moderator checks each entry before it goes live.
      </PageHeader>

      <ol className="mb-6 flex gap-2" aria-label="Progress">
        {['What and where', 'Tell us about it'].map((l, i) => (
          <li key={l} className="flex-1">
            <div className={`h-1.5 rounded-full ${step > i ? 'bg-paddy' : 'bg-ink/15'}`} />
            <p className={`mt-1.5 text-sm ${step === i + 1 ? 'font-semibold text-ink' : 'text-ink-soft'}`}>
              Step {i + 1}: {l}
            </p>
          </li>
        ))}
      </ol>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 1) {
            setTouched((t) => ({ ...t, nameEn: true, nameBn: true, districtId: true, category: true }));
            if (step1Ok) setStep(2);
          } else void submit();
        }}
        className="space-y-5 rounded-3xl bg-paper-hi p-5 sm:p-7"
      >
        {step === 1 ? (
          <>
            <div>
              <label className="label" htmlFor="nameEn">
                Food name in English
              </label>
              <input
                id="nameEn"
                className={`field ${showErr('nameEn') ? 'border-chili' : ''}`}
                value={draft.nameEn}
                maxLength={60}
                onChange={(e) => set('nameEn', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, nameEn: true }))}
                placeholder="e.g. Kalai Ruti"
                autoComplete="off"
              />
              {showErr('nameEn') && <p className="mt-1 text-sm text-chili">{showErr('nameEn')}</p>}
            </div>
            <div>
              <label className="label" htmlFor="nameBn">
                Name in Bangla <span className="font-normal text-ink-soft">(optional)</span>
              </label>
              <input id="nameBn" className="field bnui" value={draft.nameBn} maxLength={60} onChange={(e) => set('nameBn', e.target.value)} placeholder="যেমন: কালাই রুটি" lang="bn" />
            </div>
            <div>
              <span className="label">District</span>
              <DistrictPicker value={draft.districtId} onChange={(id) => set('districtId', id)} invalid={!!showErr('districtId')} />
              {division && <p className="mt-1.5 text-sm text-ink-soft">Division: {division.nameEn} ({division.nameBn}) — filled in for you</p>}
              {showErr('districtId') && <p className="mt-1 text-sm text-chili">{showErr('districtId')}</p>}
            </div>
            <fieldset>
              <legend className="label">Category</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    aria-pressed={draft.category === c.id}
                    onClick={() => set('category', c.id)}
                    className={`min-h-11 rounded-full px-4 text-sm font-semibold ${draft.category === c.id ? 'bg-paddy text-paper-hi' : 'border border-ink/15 bg-paper text-ink-soft hover:text-ink'}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {showErr('category') && <p className="mt-1 text-sm text-chili">{showErr('category')}</p>}
            </fieldset>

            {dupes.same.length > 0 && (
              <div className="rounded-2xl bg-chili-soft p-4 text-sm" role="status">
                <p className="flex items-center gap-2 font-semibold text-chili">
                  <AlertTriangle className="h-4 w-4" /> This may already be listed for {district?.nameEn}
                </p>
                <ul className="mt-1 list-disc pl-5">
                  {dupes.same.map((f) => (
                    <li key={f.id}>
                      <Link className="underline" to={`/food/${encodeURIComponent(f.id)}`} target="_blank">
                        {f.nameEn} ({f.nameBn})
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-1">If it’s a different food, carry on.</p>
              </div>
            )}
            {dupes.same.length === 0 && dupes.elsewhere.length > 0 && (
              <p className="rounded-2xl bg-turmeric-soft p-4 text-sm">
                A similar name is listed for {dupes.elsewhere.map((f) => DISTRICT_BY_ID[f.districtId].nameEn).join(', ')}. That’s fine if your district has its own version.
              </p>
            )}
            <button className="btn-primary w-full" type="submit">
              Next
            </button>
          </>
        ) : (
          <>
            <p className="rounded-2xl bg-paper px-4 py-3 text-sm">
              <strong>{cleanText(draft.nameEn)}</strong> {draft.nameBn && <span className="bnui">({draft.nameBn})</span>} · {district?.nameEn}, {division?.nameEn} Division
              <button type="button" className="ml-2 font-semibold text-paddy underline" onClick={() => setStep(1)}>
                Edit
              </button>
            </p>
            <div>
              <label className="label" htmlFor="description">
                What is it?
              </label>
              <textarea
                id="description"
                className={`field min-h-24 ${showErr('description') ? 'border-chili' : ''}`}
                maxLength={280}
                value={draft.description}
                onChange={(e) => set('description', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, description: true }))}
                placeholder="A sweet made from… / A fish curry cooked with…"
              />
              <p className="mt-1 flex justify-between text-sm">
                <span className="text-chili">{showErr('description')}</span>
                <span className="text-ink-soft">{draft.description.length}/280</span>
              </p>
            </div>
            <div>
              <label className="label" htmlFor="association">
                Why is it linked to {district?.nameEn ?? 'this district'}?
              </label>
              <textarea
                id="association"
                className={`field min-h-24 ${showErr('association') ? 'border-chili' : ''}`}
                maxLength={280}
                value={draft.association}
                onChange={(e) => set('association', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, association: true }))}
                placeholder="Where it’s made or sold, how long it’s been known there…"
              />
              <p className="mt-1 flex justify-between text-sm">
                <span className="text-chili">{showErr('association')}</span>
                <span className="text-ink-soft">{draft.association.length}/280</span>
              </p>
            </div>
            <div>
              <label className="label" htmlFor="src">
                A source link <span className="font-normal text-ink-soft">(optional)</span>
              </label>
              <input
                id="src"
                type="url"
                inputMode="url"
                className={`field ${showErr('sourceUrl') ? 'border-chili' : ''}`}
                value={draft.sourceUrl}
                maxLength={300}
                onChange={(e) => set('sourceUrl', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, sourceUrl: true }))}
                placeholder="https://… a news story or district page"
              />
              {showErr('sourceUrl') && <p className="mt-1 text-sm text-chili">{showErr('sourceUrl')}</p>}
            </div>
            {error && (
              <div className="rounded-2xl bg-chili-soft p-4 text-sm text-chili" role="alert">
                {error}
              </div>
            )}
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-chili" type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <Spinner /> Sending…
                  </>
                ) : (
                  'Send for review'
                )}
              </button>
            </div>
            <p className="text-xs text-ink-soft">One submission per minute. Links and text are shown as plain text; no images are uploaded.</p>
          </>
        )}
      </form>
    </div>
  );
}
