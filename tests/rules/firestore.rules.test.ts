/**
 * Security-rules tests. Needs Java and the Firestore emulator:
 *   npm run test:rules
 * (runs `firebase emulators:exec` around vitest). No real project or billing needed.
 */
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, runTransaction, serverTimestamp, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

let env: RulesTestEnvironment;
const FOOD = 'natore--kachagolla';

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-taste-of-bd',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
afterAll(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const as = (uid: string) => env.authenticatedContext(uid).firestore();
const anon = () => env.unauthenticatedContext().firestore();

async function rate(db: ReturnType<typeof as>, uid: string, value: number, tamperSum = 0) {
  return runTransaction(db, async (tx) => {
    const r = doc(db, 'foodRatings', `${uid}__${FOOD}`);
    const s = doc(db, 'foodStats', FOOD);
    const [rs, ss] = [await tx.get(r), await tx.get(s)];
    const b = ss.exists() ? ss.data() : { ratingSum: 0, ratingCount: 0, mustTryCount: 0 };
    const old = rs.exists() ? rs.data().value : 0;
    tx.set(r, { uid, foodId: FOOD, value, updatedAt: serverTimestamp() });
    tx.set(s, { ratingSum: b.ratingSum + value - old + tamperSum, ratingCount: b.ratingCount + (rs.exists() ? 0 : 1), mustTryCount: b.mustTryCount });
  });
}

describe('ratings and stats', () => {
  it('lets a user rate, then change their rating', async () => {
    await assertSucceeds(rate(as('alice'), 'alice', 4));
    await assertSucceeds(rate(as('alice'), 'alice', 2));
  });
  it('rejects a stats total that does not match the rating', async () => {
    await assertFails(rate(as('alice'), 'alice', 4, 50));
  });
  it('rejects writing a rating under someone else’s id', async () => {
    const db = as('mallory');
    await assertFails(setDoc(doc(db, 'foodRatings', `alice__${FOOD}`), { uid: 'alice', foodId: FOOD, value: 5, updatedAt: serverTimestamp() }));
  });
  it('rejects out-of-range ratings', async () => {
    await assertFails(rate(as('alice'), 'alice', 9));
  });
  it('rejects writing stats directly', async () => {
    await assertFails(setDoc(doc(as('alice'), 'foodStats', FOOD), { ratingSum: 999, ratingCount: 1, mustTryCount: 0 }));
  });
  it('allows anyone to read stats but not other people’s ratings', async () => {
    await rate(as('alice'), 'alice', 5);
    await assertSucceeds(getDoc(doc(anon(), 'foodStats', FOOD)));
    await assertFails(getDoc(doc(as('bob'), 'foodRatings', `alice__${FOOD}`)));
  });
});

describe('must try', () => {
  const toggle = (uid: string, on: boolean, delta = on ? 1 : -1) => {
    const db = as(uid);
    return runTransaction(db, async (tx) => {
      const r = doc(db, 'foodRecommendations', `${uid}__${FOOD}`);
      const s = doc(db, 'foodStats', FOOD);
      const ss = await tx.get(s);
      const b = ss.exists() ? ss.data() : { ratingSum: 0, ratingCount: 0, mustTryCount: 0 };
      if (on) tx.set(r, { uid, foodId: FOOD, createdAt: serverTimestamp() });
      else tx.delete(r);
      tx.set(s, { ...b, mustTryCount: b.mustTryCount + delta });
    });
  };
  it('counts one recommendation and allows removal', async () => {
    await assertSucceeds(toggle('alice', true));
    await assertSucceeds(toggle('alice', false));
  });
  it('rejects inflating the count by 5', async () => {
    await assertFails(toggle('alice', true, 5));
  });
});

describe('progress', () => {
  it('is private to its owner', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'userFoodProgress', 'alice'), { items: { [FOOD]: 'tried' }, updatedAt: serverTimestamp() }));
    await assertFails(getDoc(doc(as('bob'), 'userFoodProgress', 'alice')));
    await assertFails(setDoc(doc(as('bob'), 'userFoodProgress', 'alice'), { items: {}, updatedAt: serverTimestamp() }));
  });
});

describe('submissions and moderation', () => {
  const sub = {
    nameEn: 'Duck curry',
    nameBn: '',
    districtId: 'kishoreganj',
    divisionId: 'dhaka',
    category: 'meat',
    description: 'Duck cooked with chalkumra in winter.',
    association: 'Eaten across the haor in winter months.',
    sourceUrl: '',
    normalizedName: 'duck-curry',
  };
  const submit = (uid: string, extra: Record<string, unknown> = {}) => {
    const db = as(uid);
    return runTransaction(db, async (tx) => {
      tx.set(doc(db, 'foodSubmissions', 'kishoreganj__duck-curry'), { ...sub, status: 'pending', createdBy: uid, createdAt: serverTimestamp(), ...extra });
      tx.set(doc(db, 'userLimits', uid), { lastSubmissionAt: serverTimestamp() });
    });
  };

  it('accepts a valid pending submission', async () => {
    await assertSucceeds(submit('alice'));
  });
  it('rejects self-approval', async () => {
    await assertFails(submit('alice', { status: 'approved' }));
  });
  it('rejects markup in text', async () => {
    await assertFails(submit('alice', { description: '<script>alert(1)</script> hello' }));
  });
  it('rejects a duplicate id from another user', async () => {
    await submit('alice');
    await assertFails(submit('bob'));
  });
  it('hides pending items from the public', async () => {
    await submit('alice');
    await assertFails(getDoc(doc(anon(), 'foodSubmissions', 'kishoreganj__duck-curry')));
    await assertSucceeds(getDoc(doc(as('alice'), 'foodSubmissions', 'kishoreganj__duck-curry')));
  });
  it('lets only admins approve', async () => {
    await submit('alice');
    await env.withSecurityRulesDisabled(async (c) => setDoc(doc(c.firestore(), 'admins', 'mod'), { at: 1 }));
    const patch = { status: 'approved', reviewNote: '', reviewedAt: serverTimestamp() };
    await assertFails(updateDoc(doc(as('alice'), 'foodSubmissions', 'kishoreganj__duck-curry'), { ...patch, reviewedBy: 'alice' }));
    await assertSucceeds(updateDoc(doc(as('mod'), 'foodSubmissions', 'kishoreganj__duck-curry'), { ...patch, reviewedBy: 'mod' }));
    await assertSucceeds(getDocs(query(collection(anon(), 'foodSubmissions'), where('status', '==', 'approved'))));
  });
  it('blocks making yourself admin', async () => {
    await assertFails(setDoc(doc(as('alice'), 'admins', 'alice'), { x: 1 }));
  });
  it('blocks deleting someone else’s submission', async () => {
    await submit('alice');
    await assertFails(deleteDoc(doc(as('bob'), 'foodSubmissions', 'kishoreganj__duck-curry')));
  });
});
