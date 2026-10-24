import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  signInWithCredential,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
// Firestore Lite: a fraction of the full SDK size. We never use realtime listeners, so nothing is lost.
import { getFirestore, type Firestore } from 'firebase/firestore/lite';

/**
 * Firebase web config for project taste-of-bangladesh-528a1.
 * These are public client identifiers, not secrets — Firestore Security Rules protect the data.
 * VITE_FIREBASE_* environment variables override them (e.g. to point a fork at another project).
 */
const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDRRKIzZPOqbJaXu9pITrMrfZDL0hPDyu4',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'taste-of-bangladesh-528a1.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'taste-of-bangladesh-528a1',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'taste-of-bangladesh-528a1.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '129364133702',
  appId: env.VITE_FIREBASE_APP_ID || '1:129364133702:web:2d80f41d7368436a06c747',
};

/** When env vars are missing the app still works for browsing; community features show a setup notice. */
// VITE_FIREBASE_DISABLED=1 runs the app in device-only mode (useful for local testing).
export const firebaseEnabled = env.VITE_FIREBASE_DISABLED !== '1' && Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

if (firebaseEnabled) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
}

/** Returns the signed-in user, creating an anonymous one on first write action. */
export async function ensureUser(): Promise<User> {
  if (!auth) throw new Error('not-configured');
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

/**
 * Upgrades the anonymous account to Google so progress follows the user across devices.
 * If that Google account already exists, signs into it instead (anonymous ratings stay on the old id).
 */
export async function connectGoogle(): Promise<{ user: User; switched: boolean }> {
  if (!auth) throw new Error('not-configured');
  const provider = new GoogleAuthProvider();
  const current = auth.currentUser;
  if (current && current.isAnonymous) {
    try {
      const res = await linkWithPopup(current, provider);
      return { user: res.user, switched: false };
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code === 'auth/credential-already-in-use') {
        const cred = GoogleAuthProvider.credentialFromError(e as never);
        if (cred) {
          const res = await signInWithCredential(auth, cred);
          return { user: res.user, switched: true };
        }
      }
      throw e;
    }
  }
  const res = await signInWithPopup(auth, provider);
  return { user: res.user, switched: true };
}

export async function signOutUser() {
  if (auth) await signOut(auth);
}
