
'use client';

import { 
  Firestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  DocumentReference,
  Unsubscribe,
  getDoc
} from 'firebase/firestore';
import { UserProfile } from '@/lib/store';

/**
 * DETERMINISTIC PATH: shared-profiles/{uid}
 * This ensures that Browser A and Browser B always open the same vault.
 */
const getProfileRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'shared-profiles', uid);
};

/**
 * Save profile data to Firestore using UID as ID.
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  if (!uid) return;
  
  const ref = getProfileRef(db, uid);
  
  console.log(`[Firestore] Writing vault at: ${ref.path}`);
  
  const payload = {
    profileData: data,
    updatedAt: serverTimestamp(),
    ownerId: uid
  };

  try {
    await setDoc(ref, payload, { merge: true });
    console.log(`[Firestore] Sync Success for UID: ${uid}`);
  } catch (error) {
    console.error(`[Firestore] Sync Failure:`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time profile updates using UID.
 */
export function subscribeToProfile(
  db: Firestore, 
  uid: string, 
  onUpdate: (data: UserProfile | null) => void,
  onError: (err: any) => void
): Unsubscribe {
  const ref = getProfileRef(db, uid);
  console.log(`[Sync] Attaching real-time mirror at: ${ref.path}`);
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      console.log(`[Sync] Cloud update received for UID: ${uid}`);
      onUpdate(data.profileData as UserProfile);
    } else {
      console.log(`[Sync] No remote vault found for UID: ${uid}`);
      onUpdate(null);
    }
  }, (err) => {
    console.error(`[Sync] Mirror error at ${ref.path}:`, err);
    onError(err);
  });
}
