
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
 * FIXED: Strictly using shared-profiles/{uid} as the unique path.
 */
const getProfileRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'shared-profiles', uid);
};

const getLegacyRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'users', uid, 'profile', 'main');
};

/**
 * Save profile data to Firestore using UID as ID.
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  const ref = getProfileRef(db, uid);
  console.log(`[Firestore] PRE-WRITE: Path: ${ref.path}, UID: ${uid}`);
  
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
 * Load profile data once + Handle Migration if needed.
 */
export async function loadProfile(db: Firestore, uid: string): Promise<UserProfile | null> {
  const ref = getProfileRef(db, uid);
  console.log(`[Firestore] INITIAL READ: ${ref.path}`);
  
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      console.log(`[Firestore] READ SUCCESS: Data found at ${ref.path}`);
      return data.profileData as UserProfile;
    }

    // Migration logic: Check if data exists in legacy path
    console.log('[Firestore] No data at new path. Checking legacy path...');
    const legacyRef = getLegacyRef(db, uid);
    const legacySnap = await getDoc(legacyRef);
    
    if (legacySnap.exists()) {
      const legacyData = legacySnap.data();
      console.log('[Firestore] MIGRATION: Data found at legacy path. Porting to UID path...');
      const profile = legacyData.profileData as UserProfile;
      await saveProfile(db, uid, profile);
      return profile;
    }

    console.log('[Firestore] READ SUCCESS: No document found in any path');
    return null;
  } catch (error) {
    console.error('[Firestore] READ FAILED:', error);
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
  console.log(`[Sync] ATTACHING LISTENER: ${ref.path}`);
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      console.log(`[Sync] REAL-TIME UPDATE RECEIVED for ${uid}`);
      onUpdate(data.profileData as UserProfile);
    } else {
      console.log('[Sync] REAL-TIME LISTENER: No doc exists yet');
      onUpdate(null);
    }
  }, (err) => {
    console.error('[Sync] REAL-TIME LISTENER ERROR:', err);
    onError(err);
  });
}
