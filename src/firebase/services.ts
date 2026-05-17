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
 * This ensures that Browser A and Browser B always open the same record.
 */
const getProfileRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'shared-profiles', uid);
};

/**
 * Save profile data to Firestore using UID as ID.
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  const ref = getProfileRef(db, uid);
  
  console.log(`[Firestore] Writing to path: ${ref.path}`);
  
  const payload = {
    profileData: data,
    updatedAt: serverTimestamp(),
    ownerId: uid
  };

  try {
    await setDoc(ref, payload, { merge: true });
    console.log(`[Firestore] Write Success for UID: ${uid}`);
  } catch (error) {
    console.error(`[Firestore] Write Failure:`, error);
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
    console.log(`[Firestore] Read Success for path: ${ref.path}`);
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
  console.log(`[Sync] Establishing real-time listener at: ${ref.path}`);
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      console.log(`[Sync] Real-time update received for UID: ${uid}`);
      onUpdate(data.profileData as UserProfile);
    } else {
      console.log(`[Sync] No cloud vault found for UID: ${uid}`);
      onUpdate(null);
    }
  }, (err) => {
    console.error(`[Sync] Listener error at ${ref.path}:`, err);
    onError(err);
  });
}
