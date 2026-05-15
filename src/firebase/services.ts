
'use client';

import { 
  Firestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  DocumentReference,
  Unsubscribe
} from 'firebase/firestore';
import { UserProfile } from '@/lib/store';

/**
 * DETERMINISTIC PATH: shared-profiles/{uid}
 * This ensures every device/browser points to the SAME document for the SAME user.
 */
const getProfileRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'shared-profiles', uid);
};

/**
 * Save profile data to Firestore using UID as ID.
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  const ref = getProfileRef(db, uid);
  
  console.log(`[Firestore] Writing to document: ${ref.path}`);
  
  const payload = {
    profileData: data,
    updatedAt: serverTimestamp(),
    ownerId: uid
  };

  try {
    await setDoc(ref, payload, { merge: true });
    console.log(`[Firestore] Write success for UID: ${uid}`);
  } catch (error) {
    console.error('[Firestore] Write failed for UID:', uid, error);
    throw error;
  }
}

/**
 * Subscribe to real-time profile updates using UID.
 * Treats Firestore as the absolute source of truth.
 */
export function subscribeToProfile(
  db: Firestore, 
  uid: string, 
  onUpdate: (data: UserProfile | null) => void,
  onError: (err: any) => void
): Unsubscribe {
  const ref = getProfileRef(db, uid);
  console.log(`[Sync] Attaching realtime listener to: ${ref.path}`);
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      console.log(`[Sync] Realtime sync received for path: ${ref.path}`);
      onUpdate(data.profileData as UserProfile);
    } else {
      console.log(`[Sync] No existing profile found at ${ref.path} (New user initialization)`);
      onUpdate(null);
    }
  }, (err) => {
    console.error('[Sync] Realtime listener error for UID:', uid, err);
    onError(err);
  });
}
