
'use client';

import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp,
  DocumentReference,
  Unsubscribe
} from 'firebase/firestore';
import { UserProfile } from '@/lib/store';

/**
 * Consolidating to shared-profiles/{uid} as the single source of truth
 */
const getProfileRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'shared-profiles', uid);
};

/**
 * Save profile data to Firestore
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  const ref = getProfileRef(db, uid);
  console.log(`[Firestore] Attempting write to: ${ref.path}`);
  
  const payload = {
    profileData: data,
    updatedAt: serverTimestamp(),
    ownerId: uid
  };

  try {
    await setDoc(ref, payload, { merge: true });
    console.log('[Firestore] Write SUCCESS', { path: ref.path, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[Firestore] Write FAILED:', error);
    throw error;
  }
}

/**
 * Load profile data once (used for initial verification if needed)
 */
export async function loadProfile(db: Firestore, uid: string): Promise<UserProfile | null> {
  const ref = getProfileRef(db, uid);
  console.log(`[Firestore] Initial read from: ${ref.path}`);
  
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      console.log('[Firestore] Read SUCCESS, data found');
      return data.profileData as UserProfile;
    }
    console.log('[Firestore] Read SUCCESS, no document found');
    return null;
  } catch (error) {
    console.error('[Firestore] Read FAILED:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time profile updates
 * This is the engine that keeps multiple browsers in sync.
 */
export function subscribeToProfile(
  db: Firestore, 
  uid: string, 
  onUpdate: (data: UserProfile | null) => void,
  onError: (err: any) => void
): Unsubscribe {
  const ref = getProfileRef(db, uid);
  console.log(`[Sync] Starting real-time listener: ${ref.path}`);
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      console.log(`[Sync] UPDATE RECEIVED from cloud for ${uid}`);
      onUpdate(data.profileData as UserProfile);
    } else {
      console.log('[Sync] Listener active: Document does not exist yet');
      onUpdate(null);
    }
  }, (err) => {
    console.error('[Sync] Real-time listener ERROR:', err);
    onError(err);
  });
}
