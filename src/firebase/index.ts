
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initialize Firebase and configure persistence
 */
export function initializeFirebase() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);

  // Requirement: Ensure login persists across browser sessions and devices
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log('[Auth] Global Persistence set to browserLocalPersistence'))
    .catch((err) => console.error('[Auth] Persistence setup failed:', err));

  return { app, firestore, auth };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
