
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
 * Performs an atomic write of the entire profileData object.
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  if (!uid) return;
  
  const ref = getProfileRef(db, uid);
  
  console.log(`[Firestore] Syncing vault at: ${ref.path}`, {
    name: data.fullName,
    projects: data.projects?.length,
    jobs: data.jobs?.length,
    experience: data.experience?.length,
    education: data.education?.length
  });
  
  const payload = {
    profileData: data,
    updatedAt: serverTimestamp(),
    ownerId: uid
  };

  try {
    // We overwrite the profileData field completely to ensure collection consistency
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
  console.log(`[Sync] Attached to vault mirror at: ${ref.path}`);
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.profileData) {
        onUpdate(data.profileData as UserProfile);
      } else {
        onUpdate(null);
      }
    } else {
      console.log(`[Sync] No vault found for UID: ${uid}`);
      onUpdate(null);
    }
  }, (err) => {
    console.error(`[Sync] Listener error:`, err);
    onError(err);
  });
}
