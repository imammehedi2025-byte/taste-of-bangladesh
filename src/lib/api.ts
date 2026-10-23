/**
 * All Firestore access lives here. Every write is validated again by firestore.rules —
 * client checks are for user experience only.
 *
 * Collections
 *   userFoodProgress/{uid}                 { items: {foodId: 'want'|'tried'}, nickname, updatedAt }
 *   foodRatings/{uid}__{foodId}            { uid, foodId, value 1–5, updatedAt }
 *   foodRecommendations/{uid}__{foodId}    { uid, foodId, createdAt }
 *   foodStats/{foodId}                     { ratingSum, ratingCount, mustTryCount }
 *   foodSubmissions/{districtId}__{slug}   see Submission type
 *   userLimits/{uid}                       { lastSubmissionAt }
 *   foodReports/{auto}                     { foodId, reason, note, uid, createdAt }
 *   admins/{uid}                           created by hand in the Firebase console
 */
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  addDoc,
  updateDoc,
  where,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore/lite';
import { db, ensureUser } from './firebase';
import type { FoodCategory, FoodStats, ProgressState, Submission, SubmissionStatus, DivisionId } from '../types';

function need() {
  if (!db) throw new Error('not-configured');
  return db;
}

const pairId = (uid: string, foodId: string) => `${uid}__${foodId}`;

/* ───── Progress ───── */

export interface ProgressDoc {
  items: Record<string, ProgressState>;
  nickname: string;
}

export async function loadProgress(uid: string): Promise<ProgressDoc> {
  const snap = await getDoc(doc(need(), 'userFoodProgress', uid));
  const d = snap.data();
  return { items: (d?.items as Record<string, ProgressState>) ?? {}, nickname: (d?.nickname as string) ?? '' };
}

export async function saveProgressItem(foodId: string, state: ProgressState | null) {
  const user = await ensureUser();
  await setDoc(
    doc(need(), 'userFoodProgress', user.uid),
    { items: { [foodId]: state ?? deleteField() }, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function saveNickname(nickname: string) {
  const user = await ensureUser();
  await setDoc(doc(need(), 'userFoodProgress', user.uid), { nickname, updatedAt: serverTimestamp() }, { merge: true });
}

/** Used after switching accounts: merges progress collected under an older anonymous id. */
export async function mergeProgress(items: Record<string, ProgressState>) {
  const user = await ensureUser();
  if (Object.keys(items).length === 0) return;
  await setDoc(doc(need(), 'userFoodProgress', user.uid), { items, updatedAt: serverTimestamp() }, { merge: true });
}

/* ───── Stats (public aggregates) ───── */

let statsCache: { at: number; data: Record<string, FoodStats> } | null = null;
const STATS_TTL = 10 * 60 * 1000;

export async function loadAllStats(force = false): Promise<Record<string, FoodStats>> {
  if (!force && statsCache && Date.now() - statsCache.at < STATS_TTL) return statsCache.data;
  const snap = await getDocs(query(collection(need(), 'foodStats'), limit(500)));
  const data: Record<string, FoodStats> = {};
  snap.forEach((d) => {
    const v = d.data();
    data[d.id] = { foodId: d.id, ratingSum: v.ratingSum ?? 0, ratingCount: v.ratingCount ?? 0, mustTryCount: v.mustTryCount ?? 0 };
  });
  statsCache = { at: Date.now(), data };
  return data;
}

export function patchStatsCache(s: FoodStats) {
  if (statsCache) statsCache.data[s.foodId] = s;
}

/* ───── Ratings ───── */

export async function loadMyRatings(uid: string): Promise<Record<string, number>> {
  const snap = await getDocs(query(collection(need(), 'foodRatings'), where('uid', '==', uid), limit(500)));
  const out: Record<string, number> = {};
  snap.forEach((d) => (out[d.data().foodId] = d.data().value));
  return out;
}

/** Writes the rating and the aggregate in one transaction; the rules check both sides agree. */
export async function rateFood(foodId: string, value: number): Promise<FoodStats> {
  if (!Number.isInteger(value) || value < 1 || value > 5) throw new Error('invalid-argument');
  const user = await ensureUser();
  const fs = need();
  const ratingRef = doc(fs, 'foodRatings', pairId(user.uid, foodId));
  const statsRef = doc(fs, 'foodStats', foodId);
  return runTransaction(fs, async (tx) => {
    const [r, s] = await Promise.all([tx.get(ratingRef), tx.get(statsRef)]);
    const before = s.exists() ? (s.data() as DocumentData) : { ratingSum: 0, ratingCount: 0, mustTryCount: 0 };
    const oldVal = r.exists() ? (r.data().value as number) : 0;
    const next = {
      ratingSum: before.ratingSum + value - oldVal,
      ratingCount: before.ratingCount + (r.exists() ? 0 : 1),
      mustTryCount: before.mustTryCount,
    };
    tx.set(ratingRef, { uid: user.uid, foodId, value, updatedAt: serverTimestamp() });
    tx.set(statsRef, next);
    return { foodId, ...next };
  });
}

/* ───── Must Try ───── */

export async function loadMyRecommendations(uid: string): Promise<Set<string>> {
  const snap = await getDocs(query(collection(need(), 'foodRecommendations'), where('uid', '==', uid), limit(500)));
  return new Set(snap.docs.map((d) => d.data().foodId as string));
}

export async function setMustTry(foodId: string, on: boolean): Promise<FoodStats> {
  const user = await ensureUser();
  const fs = need();
  const recRef = doc(fs, 'foodRecommendations', pairId(user.uid, foodId));
  const statsRef = doc(fs, 'foodStats', foodId);
  return runTransaction(fs, async (tx) => {
    const [r, s] = await Promise.all([tx.get(recRef), tx.get(statsRef)]);
    const before = s.exists() ? (s.data() as DocumentData) : { ratingSum: 0, ratingCount: 0, mustTryCount: 0 };
    if (r.exists() === on) return { foodId, ...(before as Omit<FoodStats, 'foodId'>) }; // already in that state
    const next = { ratingSum: before.ratingSum, ratingCount: before.ratingCount, mustTryCount: before.mustTryCount + (on ? 1 : -1) };
    if (on) tx.set(recRef, { uid: user.uid, foodId, createdAt: serverTimestamp() });
    else tx.delete(recRef);
    tx.set(statsRef, next);
    return { foodId, ...next };
  });
}

/* ───── Community submissions ───── */

export interface NewSubmission {
  nameEn: string;
  nameBn: string;
  districtId: string;
  divisionId: DivisionId;
  category: FoodCategory;
  description: string;
  association: string;
  sourceUrl: string;
  normalizedName: string;
}

export const submissionId = (districtId: string, normalizedName: string) => `${districtId}__${normalizedName}`;

export class DuplicateSubmissionError extends Error {
  code = 'already-exists';
}
export class ThrottledError extends Error {
  code = 'throttled';
}

export async function submitFood(input: NewSubmission): Promise<string> {
  const user = await ensureUser();
  const fs = need();
  const id = submissionId(input.districtId, input.normalizedName);
  const ref = doc(fs, 'foodSubmissions', id);
  const limitRef = doc(fs, 'userLimits', user.uid);
  try {
    await runTransaction(fs, async (tx) => {
      tx.set(ref, { ...input, status: 'pending', createdBy: user.uid, createdAt: serverTimestamp() });
      tx.set(limitRef, { lastSubmissionAt: serverTimestamp() });
    });
  } catch (e) {
    // Two rule-level reasons produce permission-denied here:
    //  1. the 60-second per-user cooldown, or
    //  2. the id already exists (same name + district submitted before), so the write counts as
    //     an update, which only admins may do.
    const code = (e as { code?: string }).code ?? '';
    if (code.includes('permission-denied')) {
      const lim = await getDoc(limitRef).catch(() => null);
      const last = (lim?.data()?.lastSubmissionAt as Timestamp | undefined)?.toMillis?.() ?? 0;
      if (Date.now() - last < 65_000) throw new ThrottledError('throttled');
      throw new DuplicateSubmissionError('duplicate');
    }
    throw e;
  }
  return id;
}

function toSubmission(id: string, d: DocumentData): Submission {
  return {
    id,
    nameEn: d.nameEn,
    nameBn: d.nameBn ?? '',
    districtId: d.districtId,
    divisionId: d.divisionId,
    category: d.category,
    description: d.description,
    association: d.association,
    sourceUrl: d.sourceUrl ?? '',
    normalizedName: d.normalizedName,
    status: d.status,
    createdBy: d.createdBy,
    createdAt: (d.createdAt as Timestamp | null)?.toDate?.() ?? null,
    reviewNote: d.reviewNote,
  };
}

export async function loadApprovedSubmissions(max = 200): Promise<Submission[]> {
  const snap = await getDocs(query(collection(need(), 'foodSubmissions'), where('status', '==', 'approved'), limit(max)));
  return snap.docs.map((d) => toSubmission(d.id, d.data()));
}

export async function loadMySubmissions(uid: string): Promise<Submission[]> {
  const snap = await getDocs(query(collection(need(), 'foodSubmissions'), where('createdBy', '==', uid), limit(50)));
  return snap.docs.map((d) => toSubmission(d.id, d.data()));
}

/* ───── Reports ───── */

export async function reportFood(foodId: string, reason: string, note: string) {
  const user = await ensureUser();
  await addDoc(collection(need(), 'foodReports'), { foodId, reason, note, uid: user.uid, createdAt: serverTimestamp() });
}

/* ───── Admin ───── */

export async function isAdmin(uid: string): Promise<boolean> {
  try {
    return (await getDoc(doc(need(), 'admins', uid))).exists();
  } catch {
    return false;
  }
}

export async function loadSubmissionsByStatus(status: SubmissionStatus): Promise<Submission[]> {
  const snap = await getDocs(
    query(collection(need(), 'foodSubmissions'), where('status', '==', status), orderBy('createdAt', 'desc'), limit(100)),
  );
  return snap.docs.map((d) => toSubmission(d.id, d.data()));
}

export async function moderateSubmission(id: string, status: 'approved' | 'rejected', reviewNote: string) {
  const user = await ensureUser();
  await updateDoc(doc(need(), 'foodSubmissions', id), {
    status,
    reviewNote,
    reviewedBy: user.uid,
    reviewedAt: serverTimestamp(),
  });
}

export async function loadReports() {
  const snap = await getDocs(query(collection(need(), 'foodReports'), orderBy('createdAt', 'desc'), limit(100)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as { foodId: string; reason: string; note: string }) }));
}
