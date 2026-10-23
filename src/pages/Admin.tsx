import { Check, ExternalLink, LogIn, RotateCw, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { loadReports, loadSubmissionsByStatus, moderateSubmission } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { DISTRICT_BY_ID } from '../data/districts';
import { FOOD_BY_ID } from '../data/foods';
import { CATEGORY_BY_ID } from '../utils/meta';
import { EmptyState, PageHeader, Spinner } from '../components/ui';
import type { Submission, SubmissionStatus } from '../types';
import { cleanText } from '../utils/text';

/**
 * Moderation. Hiding this page is NOT the security — firestore.rules only allow
 * users listed in /admins/{uid} to read pending items or change status.
 */
export default function Admin() {
  const { user, isAdmin, authReady, firebaseEnabled, linkGoogle, toast, reloadCommunity } = useApp();
  const [tab, setTab] = useState<SubmissionStatus | 'reports'>('pending');
  const [items, setItems] = useState<Submission[]>([]);
  const [reports, setReports] = useState<{ id: string; foodId: string; reason: string; note: string }[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [busyId, setBusyId] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setState('loading');
    try {
      if (tab === 'reports') setReports(await loadReports());
      else setItems(await loadSubmissionsByStatus(tab));
      setState('idle');
    } catch {
      setState('error');
    }
  }, [isAdmin, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(s: Submission, status: 'approved' | 'rejected') {
    setBusyId(s.id);
    try {
      await moderateSubmission(s.id, status, cleanText(notes[s.id] ?? '').slice(0, 200));
      setItems((list) => list.filter((x) => x.id !== s.id));
      toast({ kind: 'success', text: status === 'approved' ? `Approved “${s.nameEn}”. It is now public.` : `Rejected “${s.nameEn}”.` });
      reloadCommunity();
    } catch (e) {
      toast({ kind: 'error', text: friendlyError(e) });
    } finally {
      setBusyId('');
    }
  }

  if (!firebaseEnabled) return <div className="py-12"><EmptyState title="Moderation needs the Firebase connection" /></div>;
  if (!authReady) return <p className="flex items-center gap-2 py-12"><Spinner /> Checking access…</p>;
  if (!isAdmin)
    return (
      <div className="max-w-xl py-12">
        <PageHeader title="Moderation" />
        <p className="text-ink-soft">This area is for moderators. If you are the site owner, follow “Make yourself an admin” in the README, using this ID:</p>
        <p className="mt-2 rounded-xl bg-paper-hi p-3 font-semibold break-all">{user?.uid ?? 'Sign in first to see your ID'}</p>
        {(!user || user.isAnonymous) && (
          <button className="btn-primary mt-4" onClick={linkGoogle}>
            <LogIn className="h-4 w-4" /> Sign in with Google
          </button>
        )}
        <Link to="/" className="mt-4 block text-paddy underline">
          Back home
        </Link>
      </div>
    );

  return (
    <div>
      <PageHeader title="Moderation" titleBn="যাচাই">
        Approve accurate, non-duplicate local specialties. Rejected items stay hidden from the public.
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'reports'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 font-semibold capitalize ${tab === t ? 'bg-ink text-paper-hi' : 'bg-paper-hi'}`}>
            {t}
          </button>
        ))}
        <button className="btn-ghost min-h-10 px-4 text-sm" onClick={load}>
          <RotateCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {state === 'loading' ? (
        <p className="flex items-center gap-2"><Spinner /> Loading…</p>
      ) : state === 'error' ? (
        <EmptyState title="Couldn’t load" action={<button className="btn-ghost" onClick={load}>Retry</button>}>
          If this is the first run, Firestore may still be building the index for this list. Wait a few minutes.
        </EmptyState>
      ) : tab === 'reports' ? (
        reports.length === 0 ? (
          <EmptyState title="No reports" />
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded-2xl bg-paper-hi p-4">
                <Link to={`/food/${encodeURIComponent(r.foodId)}`} className="font-semibold text-paddy underline">
                  {FOOD_BY_ID[r.foodId]?.nameEn ?? r.foodId}
                </Link>
                <p className="text-sm">{r.reason.replace('-', ' ')}</p>
                {r.note && <p className="mt-1 text-sm text-ink-soft">{r.note}</p>}
              </li>
            ))}
          </ul>
        )
      ) : items.length === 0 ? (
        <EmptyState title={`No ${tab} submissions`} />
      ) : (
        <ul className="space-y-4">
          {items.map((s) => (
            <li key={s.id} className="rounded-3xl bg-paper-hi p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-bold">
                  {s.nameEn} <span className="bnui font-normal text-ink-soft">{s.nameBn}</span>
                </h2>
                <span className="text-sm text-ink-soft">
                  {DISTRICT_BY_ID[s.districtId]?.nameEn} · {CATEGORY_BY_ID[s.category]?.label} · {s.createdAt?.toLocaleDateString() ?? ''}
                </span>
              </div>
              <p className="mt-2">{s.description}</p>
              <p className="mt-1 text-ink-soft">Why here: {s.association}</p>
              {s.sourceUrl && (
                <a className="mt-1 inline-flex items-center gap-1 text-sm break-all text-paddy underline" href={s.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
                  <ExternalLink className="h-3.5 w-3.5" /> {s.sourceUrl}
                </a>
              )}
              {s.reviewNote && <p className="mt-2 text-sm">Note: {s.reviewNote}</p>}
              {(
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    className="field sm:flex-1"
                    placeholder="Note to contributor (optional)"
                    maxLength={200}
                    value={notes[s.id] ?? ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                  />
                  {tab !== 'approved' && (
                    <button className="btn-primary" disabled={busyId === s.id} onClick={() => decide(s, 'approved')}>
                      {busyId === s.id ? <Spinner /> : <Check className="h-4 w-4" />} Approve
                    </button>
                  )}
                  {tab !== 'rejected' && (
                    <button className="btn-ghost text-chili" disabled={busyId === s.id} onClick={() => decide(s, 'rejected')}>
                      <X className="h-4 w-4" /> Reject
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
