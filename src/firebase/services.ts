
'use client';

import { 
  Firestore, 
  doc, 
  setDoc, 
  addDoc,
  collection,
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  updateDoc,
  query,
  where,
  Unsubscribe
} from 'firebase/firestore';
import { UserProfile, JobEntry, ExperienceEntry, ProjectEntry } from '@/lib/store';

// --- Generic CRUD Operations ---

const log = (action: string, path: string, data?: any) => {
  console.log(`[Firestore] ${action.toUpperCase()} at ${path}`, data || '');
};

const logError = (action: string, path: string, error: any) => {
  console.error(`[Firestore Error] ${action.toUpperCase()} failed at ${path}:`, error);
};

// --- Profile Services ---

export async function saveProfileInfo(db: Firestore, uid: string, data: Partial<UserProfile>) {
  const path = `users/${uid}/profile/basic`;
  try {
    const ref = doc(db, 'users', uid, 'profile', 'basic');
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    log('save profile', path, data);
  } catch (error) {
    logError('save profile', path, error);
    throw error;
  }
}

export function subscribeToProfileInfo(db: Firestore, uid: string, onUpdate: (data: any) => void): Unsubscribe {
  const ref = doc(db, 'users', uid, 'profile', 'basic');
  return onSnapshot(ref, (snap) => {
    onUpdate(snap.exists() ? snap.data() : null);
  });
}

// --- Jobs Services ---

export async function addJob(db: Firestore, uid: string, data: Omit<JobEntry, 'id'>) {
  const path = `users/${uid}/jobs`;
  try {
    const colRef = collection(db, 'users', uid, 'jobs');
    const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    log('add job', `${path}/${docRef.id}`, data);
    return docRef.id;
  } catch (error) {
    logError('add job', path, error);
    throw error;
  }
}

export async function updateJob(db: Firestore, uid: string, jobId: string, data: Partial<JobEntry>) {
  const path = `users/${uid}/jobs/${jobId}`;
  try {
    const docRef = doc(db, 'users', uid, 'jobs', jobId);
    await updateDoc(docRef, data);
    log('update job', path, data);
  } catch (error) {
    logError('update job', path, error);
    throw error;
  }
}

export async function deleteJob(db: Firestore, uid: string, jobId: string) {
  const path = `users/${uid}/jobs/${jobId}`;
  try {
    const docRef = doc(db, 'users', uid, 'jobs', jobId);
    await deleteDoc(docRef);
    log('delete job', path);
  } catch (error) {
    logError('delete job', path, error);
    throw error;
  }
}

export function subscribeToJobs(db: Firestore, uid: string, onUpdate: (data: JobEntry[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'jobs');
  return onSnapshot(colRef, (snap) => {
    const jobs = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as JobEntry));
    onUpdate(jobs);
  });
}

// --- Experience Services ---

export async function addExperience(db: Firestore, uid: string, data: Omit<ExperienceEntry, 'id'>) {
  const path = `users/${uid}/experience`;
  try {
    const colRef = collection(db, 'users', uid, 'experience');
    const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    log('add experience', `${path}/${docRef.id}`, data);
    return docRef.id;
  } catch (error) {
    logError('add experience', path, error);
    throw error;
  }
}

export async function updateExperience(db: Firestore, uid: string, expId: string, data: Partial<ExperienceEntry>) {
  const path = `users/${uid}/experience/${expId}`;
  try {
    const docRef = doc(db, 'users', uid, 'experience', expId);
    await updateDoc(docRef, data);
    log('update experience', path, data);
  } catch (error) {
    logError('update experience', path, error);
    throw error;
  }
}

export async function deleteExperience(db: Firestore, uid: string, expId: string) {
  const path = `users/${uid}/experience/${expId}`;
  try {
    const docRef = doc(db, 'users', uid, 'experience', expId);
    await deleteDoc(docRef);
    log('delete experience', path);
  } catch (error) {
    logError('delete experience', path, error);
    throw error;
  }
}

export function subscribeToExperience(db: Firestore, uid: string, onUpdate: (data: ExperienceEntry[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'experience');
  return onSnapshot(colRef, (snap) => {
    const exp = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ExperienceEntry));
    onUpdate(exp);
  });
}

// --- Projects Services ---

export async function addProject(db: Firestore, uid: string, data: Omit<ProjectEntry, 'id'>) {
  const path = `users/${uid}/projects`;
  try {
    const colRef = collection(db, 'users', uid, 'projects');
    const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    log('add project', `${path}/${docRef.id}`, data);
    return docRef.id;
  } catch (error) {
    logError('add project', path, error);
    throw error;
  }
}

export async function updateProject(db: Firestore, uid: string, projId: string, data: Partial<ProjectEntry>) {
  const path = `users/${uid}/projects/${projId}`;
  try {
    const docRef = doc(db, 'users', uid, 'projects', projId);
    await updateDoc(docRef, data);
    log('update project', path, data);
  } catch (error) {
    logError('update project', path, error);
    throw error;
  }
}

export async function deleteProject(db: Firestore, uid: string, projId: string) {
  const path = `users/${uid}/projects/${projId}`;
  try {
    const docRef = doc(db, 'users', uid, 'projects', projId);
    await deleteDoc(docRef);
    log('delete project', path);
  } catch (error) {
    logError('delete project', path, error);
    throw error;
  }
}

export function subscribeToProjects(db: Firestore, uid: string, onUpdate: (data: ProjectEntry[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'projects');
  return onSnapshot(colRef, (snap) => {
    const projects = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProjectEntry));
    onUpdate(projects);
  });
}
