import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, connectGoogle, firebaseEnabled, signOutUser } from '../lib/firebase';
import * as api from '../lib/api';
import { friendlyError } from '../lib/errors';
import type { Food, FoodStats, ProgressState, Submission } from '../types';
import { DISTRICT_BY_ID } from '../data/districts';

export interface Toast {
  id: number;
  kind: 'success' | 'error' | 'info';
  text: string;
  action?: { label: string; run: () => void };
  /** keep visible until dismissed */
  sticky?: boolean;
}

interface AppState {
  firebaseEnabled: boolean;
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  progress: Record<string, ProgressState>;
  nickname: string;
  pending: Set<string>;
  stats: Record<string, FoodStats>;
  statsState: 'idle' | 'loading' | 'ready' | 'error';
  myRatings: Record<string, number>;
  myRecs: Set<string>;
  community: Food[];
  communityState: 'idle' | 'loading' | 'ready' | 'error';
  toasts: Toast[];
  setProgress: (foodId: string, state: ProgressState | null) => Promise<boolean>;
  rate: (foodId: string, value: number) => Promise<boolean>;
  toggleMustTry: (foodId: string) => Promise<boolean>;
  setNickname: (n: string) => Promise<boolean>;
  reloadStats: () => void;
  reloadCommunity: () => void;
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
  linkGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);
const LS_KEY = 'tob.progress.v1';
const LS_NICK = 'tob.nickname.v1';

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be blocked — the app still works for this visit */
  }
}

export function submissionToFood(s: Submission): Food {
  return {
    id: `c_${s.id}`,
    districtId: s.districtId,
    divisionId: DISTRICT_BY_ID[s.districtId]?.divisionId ?? s.divisionId,
    nameEn: s.nameEn,
    nameBn: s.nameBn || s.nameEn,
    description: s.description,
    category: s.category,
    association: s.association,
    sources: [],
    evidence: s.sourceUrl ? `Contributor’s source: ${s.sourceUrl}` : 'No source given by the contributor.',
    status: 'Community Contributed',
    evidenceLevel: 'single',
    community: true,
    notes: s.sourceUrl || undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseEnabled);
  const [isAdmin, setIsAdmin] = useState(false);
  // Without Firebase the app falls back to device-only progress (clearly labelled in the UI).
  const [progress, setProgressMap] = useState<Record<string, ProgressState>>(() => readLocal(LS_KEY, {}));
  const [nickname, setNick] = useState<string>(() => readLocal(LS_NICK, ''));
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<Record<string, FoodStats>>({});
  const [statsState, setStatsState] = useState<AppState['statsState']>('idle');
  const [myRatings, setMyRatings] = useState<Record<string, number>>({});
  const [myRecs, setMyRecs] = useState<Set<string>>(new Set());
  const [community, setCommunity] = useState<Food[]>([]);
  const [communityState, setCommunityState] = useState<AppState['communityState']>('idle');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = toastId.current++;
    setToasts((list) => [...list.slice(-2), { ...t, id }]);
    if (!t.sticky) setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), t.action ? 7000 : 4000);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((x) => x.id !== id)), []);

  const mark = (key: string, on: boolean) =>
    setPending((s) => {
      const n = new Set(s);
      if (on) n.add(key);
      else n.delete(key);
      return n;
    });

  // Auth + per-user data
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) {
        setIsAdmin(false);
        return;
      }
      try {
        const [p, r, recs, admin] = await Promise.all([
          api.loadProgress(u.uid),
          api.loadMyRatings(u.uid),
          api.loadMyRecommendations(u.uid),
          api.isAdmin(u.uid),
        ]);
        setProgressMap(p.items);
        writeLocal(LS_KEY, p.items);
        if (p.nickname) {
          setNick(p.nickname);
          writeLocal(LS_NICK, p.nickname);
        }
        setMyRatings(r);
        setMyRecs(recs);
        setIsAdmin(admin);
      } catch (e) {
        toast({ kind: 'error', text: friendlyError(e) });
      }
    });
  }, [toast]);

  const reloadStats = useCallback(() => {
    if (!firebaseEnabled) return;
    setStatsState('loading');
    api
      .loadAllStats(true)
      .then((s) => {
        setStats(s);
        setStatsState('ready');
      })
      .catch(() => setStatsState('error'));
  }, []);

  useEffect(() => {
    if (!firebaseEnabled) return;
    setStatsState('loading');
    api
      .loadAllStats()
      .then((s) => {
        setStats(s);
        setStatsState('ready');
      })
      .catch(() => setStatsState('error'));
  }, []);

  const reloadCommunity = useCallback(() => {
    if (!firebaseEnabled) {
      setCommunityState('ready');
      return;
    }
    setCommunityState('loading');
    api
      .loadApprovedSubmissions()
      .then((list) => {
        setCommunity(list.map(submissionToFood));
        setCommunityState('ready');
      })
      .catch(() => setCommunityState('error'));
  }, []);

  useEffect(() => {
    reloadCommunity();
  }, [reloadCommunity]);

  const setProgress = useCallback(
    async (foodId: string, state: ProgressState | null) => {
      const key = `p:${foodId}`;
      mark(key, true);
      try {
        if (firebaseEnabled) await api.saveProgressItem(foodId, state);
        setProgressMap((m) => {
          const next = { ...m };
          if (state) next[foodId] = state;
          else delete next[foodId];
          writeLocal(LS_KEY, next);
          return next;
        });
        return true;
      } catch (e) {
        toast({ kind: 'error', text: friendlyError(e), action: { label: 'Retry', run: () => void setProgressRef.current(foodId, state) } });
        return false;
      } finally {
        mark(key, false);
      }
    },
    [toast],
  );
  const setProgressRef = useRef(setProgress);
  setProgressRef.current = setProgress;

  const rate = useCallback(
    async (foodId: string, value: number) => {
      const key = `r:${foodId}`;
      mark(key, true);
      try {
        const s = await api.rateFood(foodId, value);
        api.patchStatsCache(s);
        setStats((m) => ({ ...m, [foodId]: s }));
        setMyRatings((m) => ({ ...m, [foodId]: value }));
        return true;
      } catch (e) {
        toast({ kind: 'error', text: friendlyError(e), action: { label: 'Retry', run: () => void rateRef.current(foodId, value) } });
        return false;
      } finally {
        mark(key, false);
      }
    },
    [toast],
  );
  const rateRef = useRef(rate);
  rateRef.current = rate;

  const toggleMustTry = useCallback(
    async (foodId: string) => {
      const key = `m:${foodId}`;
      mark(key, true);
      const on = !myRecs.has(foodId);
      try {
        const s = await api.setMustTry(foodId, on);
        api.patchStatsCache(s);
        setStats((m) => ({ ...m, [foodId]: s }));
        setMyRecs((set) => {
          const n = new Set(set);
          if (on) n.add(foodId);
          else n.delete(foodId);
          return n;
        });
        return true;
      } catch (e) {
        toast({ kind: 'error', text: friendlyError(e) });
        return false;
      } finally {
        mark(key, false);
      }
    },
    [myRecs, toast],
  );

  const setNickname = useCallback(
    async (n: string) => {
      try {
        if (firebaseEnabled) await api.saveNickname(n);
        setNick(n);
        writeLocal(LS_NICK, n);
        return true;
      } catch (e) {
        toast({ kind: 'error', text: friendlyError(e) });
        return false;
      }
    },
    [toast],
  );

  const linkGoogle = useCallback(async () => {
    const before = { ...progress };
    try {
      const { user: u, switched } = await connectGoogle();
      if (switched) {
        await api.mergeProgress(before);
        const p = await api.loadProgress(u.uid);
        setProgressMap(p.items);
        writeLocal(LS_KEY, p.items);
      }
      toast({ kind: 'success', text: 'Connected. Your passport now follows you to any device where you sign in.' });
    } catch (e) {
      toast({ kind: 'error', text: friendlyError(e) });
    }
  }, [progress, toast]);

  const signOut = useCallback(async () => {
    await signOutUser();
    setProgressMap({});
    setMyRatings({});
    setMyRecs(new Set());
    writeLocal(LS_KEY, {});
    toast({ kind: 'info', text: 'Signed out on this device.' });
  }, [toast]);

  const value = useMemo<AppState>(
    () => ({
      firebaseEnabled,
      user,
      authReady,
      isAdmin,
      progress,
      nickname,
      pending,
      stats,
      statsState,
      myRatings,
      myRecs,
      community,
      communityState,
      toasts,
      setProgress,
      rate,
      toggleMustTry,
      setNickname,
      reloadStats,
      reloadCommunity,
      toast,
      dismiss,
      linkGoogle,
      signOut,
    }),
    [user, authReady, isAdmin, progress, nickname, pending, stats, statsState, myRatings, myRecs, community, communityState, toasts, setProgress, rate, toggleMustTry, setNickname, reloadStats, reloadCommunity, toast, dismiss, linkGoogle, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}
