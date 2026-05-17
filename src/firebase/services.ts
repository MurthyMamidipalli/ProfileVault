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
 * This is the global source of truth for all devices.
 */
const getProfileRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'shared-profiles', uid);
};

/**
 * Save profile data to Firestore using UID as ID.
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  const ref = getProfileRef(db, uid);
  
  console.log(`[Firestore] Syncing vault at: ${ref.path}`);
  
  const payload = {
    profileData: data,
    updatedAt: serverTimestamp(),
    ownerId: uid
  };

  try {
    await setDoc(ref, payload, { merge: true });
    console.log(`[Firestore] Sync Success: ${uid}`);
  } catch (error) {
    console.error(`[Firestore] Sync Failure:`, error);
    throw error;
  }
}

/**
 * Load profile once (useful for initial hydration)
 */
export async function loadProfile(db: Firestore, uid: string): Promise<UserProfile | null> {
  const ref = getProfileRef(db, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().profileData as UserProfile;
  }
  return null;
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
  console.log(`[Sync] Attaching cloud listener: ${ref.path}`);
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      console.log(`[Sync] Remote update received for: ${uid}`);
      onUpdate(data.profileData as UserProfile);
    } else {
      console.log(`[Sync] No cloud vault found for: ${uid}`);
      onUpdate(null);
    }
  }, (err) => {
    console.error(`[Sync] Cloud listener error:`, err);
    onError(err);
  });
}
