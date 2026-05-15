
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
 * Deterministic Profile Path: shared-profiles/{uid}
 */
const getProfileRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'shared-profiles', uid);
};

/**
 * Save profile data to Firestore using UID as ID.
 * Logs the full path and status for debugging.
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  const ref = getProfileRef(db, uid);
  console.log(`[Firestore] ATTEMPT WRITE: ${ref.path}`);
  
  const payload = {
    profileData: data,
    updatedAt: serverTimestamp(),
    ownerId: uid
  };

  try {
    await setDoc(ref, payload, { merge: true });
    console.log(`[Firestore] WRITE SUCCESS: ${ref.path}`);
  } catch (error) {
    console.error('[Firestore] WRITE FAILED:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time profile updates using UID.
 * Includes detailed logging for cross-browser debugging.
 */
export function subscribeToProfile(
  db: Firestore, 
  uid: string, 
  onUpdate: (data: UserProfile | null) => void,
  onError: (err: any) => void
): Unsubscribe {
  const ref = getProfileRef(db, uid);
  console.log(`[Sync] ATTACHING REAL-TIME LISTENER: ${ref.path}`);
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      console.log(`[Sync] CLOUD UPDATE RECEIVED for ${uid}`);
      onUpdate(data.profileData as UserProfile);
    } else {
      console.log('[Sync] NO CLOUD DATA FOUND for this UID');
      onUpdate(null);
    }
  }, (err) => {
    console.error('[Sync] REAL-TIME LISTENER ERROR:', err);
    onError(err);
  });
}
