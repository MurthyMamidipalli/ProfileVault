
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
 */
const getProfileRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'shared-profiles', uid);
};

/**
 * Save profile data to Firestore using UID as ID.
 * Performs a clean, atomic overwrite of the document to ensure 100% state mirroring.
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  if (!uid) return;
  
  const ref = getProfileRef(db, uid);
  
  // We use a clean overwrite (no merge: true) to ensure the Firestore document 
  // exactly matches the local store state for the profileData field.
  const payload = {
    profileData: data,
    updatedAt: serverTimestamp(),
    ownerId: uid
  };

  try {
    await setDoc(ref, payload);
    console.log(`[Firestore] Atomic Sync Success for UID: ${uid} (${data.projects?.length || 0} projects)`);
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
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.profileData) {
        onUpdate(data.profileData as UserProfile);
      } else {
        onUpdate(null);
      }
    } else {
      onUpdate(null);
    }
  }, (err) => {
    console.error(`[Sync] Listener error:`, err);
    onError(err);
  });
}
