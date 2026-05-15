
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
 * PATH: users/{uid}/profile/main
 */
const getProfileRef = (db: Firestore, uid: string): DocumentReference => {
  return doc(db, 'users', uid, 'profile', 'main');
};

/**
 * Save profile data to Firestore
 */
export async function saveProfile(db: Firestore, uid: string, data: UserProfile) {
  const ref = getProfileRef(db, uid);
  console.log(`[Firestore] Saving profile to: ${ref.path}`);
  
  try {
    await setDoc(ref, {
      profileData: data,
      updatedAt: serverTimestamp(),
      ownerId: uid
    }, { merge: true });
    console.log('[Firestore] Write successful');
  } catch (error) {
    console.error('[Firestore] Write failed:', error);
    throw error;
  }
}

/**
 * Load profile data once
 */
export async function loadProfile(db: Firestore, uid: string): Promise<UserProfile | null> {
  const ref = getProfileRef(db, uid);
  console.log(`[Firestore] Reading profile from: ${ref.path}`);
  
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      console.log('[Firestore] Read successful, data found');
      return snap.data().profileData as UserProfile;
    }
    console.log('[Firestore] Read successful, but document does not exist');
    return null;
  } catch (error) {
    console.error('[Firestore] Read failed:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time profile updates
 */
export function subscribeToProfile(
  db: Firestore, 
  uid: string, 
  callback: (data: UserProfile | null) => void,
  onError: (err: any) => void
): Unsubscribe {
  const ref = getProfileRef(db, uid);
  console.log(`[Firestore] Initializing real-time listener for: ${ref.path}`);
  
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      console.log('[Firestore] Real-time update received');
      callback(snap.data().profileData as UserProfile);
    } else {
      console.log('[Firestore] Real-time listener: No document found');
      callback(null);
    }
  }, (err) => {
    console.error('[Firestore] Real-time listener error:', err);
    onError(err);
  });
}
