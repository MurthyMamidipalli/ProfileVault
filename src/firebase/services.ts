
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
  orderBy,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';
import { UserProfile, JobEntry, ExperienceEntry, ProjectEntry, ResumeDocument, EducationEntry, SocialLink } from '@/lib/store';

/**
 * @fileOverview Atomic Firestore Service Layer
 * Handles multi-item persistence using sub-collections to avoid the 1MB limit.
 */

// --- Logging Helpers ---
const log = (action: string, path: string) => console.log(`[Firestore] ${action.toUpperCase()} success at ${path}`);
const logError = (action: string, path: string, error: any) => console.error(`[Firestore Error] ${action.toUpperCase()} failed at ${path}:`, error);

// --- Mirror Helpers ---
// Distributed mirroring to public vault to bypass 1MB document limit
async function mirrorToPublic(db: Firestore, uid: string, type: string, id: string, data: any, isDelete = false) {
  const path = `shared-profiles/${uid}/${type}/${id}`;
  try {
    const ref = doc(db, 'shared-profiles', uid, type, id);
    if (isDelete) {
      await deleteDoc(ref);
    } else {
      // Ensure the mirror always has a timestamp for sorting in the public view
      // We use serverTimestamp to ensure consistency, falling back to current Timestamp if needed
      await setDoc(ref, { 
        ...data, 
        updatedAt: serverTimestamp(),
        // We preserve original createdAt if it exists, otherwise set it
        createdAt: data.createdAt || serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.error(`[Mirror Error] Failed to mirror ${type} to public vault:`, err);
  }
}

// --- Profile Info (Single Doc) ---
export async function saveProfileInfo(db: Firestore, uid: string, data: Partial<UserProfile>) {
  const path = `users/${uid}/profile/basic`;
  try {
    const ref = doc(db, 'users', uid, 'profile', 'basic');
    // Ensure we don't accidentally save huge nested arrays to the basic profile doc
    const { education, experience, projects, portfolioLinks, resumes, coverLetters, jobs, ...cleanData } = data as any;
    const updateData = { ...cleanData, updatedAt: serverTimestamp() };
    
    await setDoc(ref, updateData, { merge: true });
    
    // Mirror basic metadata to the root of the shared profile
    await setDoc(doc(db, 'shared-profiles', uid), { profileData: updateData, publishedAt: serverTimestamp() }, { merge: true });
    
    log('save profile', path);
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

// --- CRUD Factory for Sub-collections ---
// Generic handler for multi-item sub-collections (Jobs, Education, Experience, Projects, Links)

async function addItem(db: Firestore, uid: string, collectionName: string, data: any) {
  try {
    const colRef = collection(db, 'users', uid, collectionName);
    const timestamp = serverTimestamp();
    const docData = { ...data, createdAt: timestamp, updatedAt: timestamp };
    const docRef = await addDoc(colRef, docData);
    
    // Mirror the exact data to the public shared profile
    await mirrorToPublic(db, uid, collectionName, docRef.id, docData);
    
    log(`add ${collectionName}`, docRef.path);
    return docRef.id;
  } catch (error) {
    logError(`add ${collectionName}`, `users/${uid}/${collectionName}`, error);
    throw error;
  }
}

async function updateItem(db: Firestore, uid: string, collectionName: string, id: string, data: any) {
  try {
    const docRef = doc(db, 'users', uid, collectionName, id);
    const timestamp = serverTimestamp();
    const updateData = { ...data, updatedAt: timestamp };
    
    await updateDoc(docRef, updateData);
    await mirrorToPublic(db, uid, collectionName, id, updateData);
    
    log(`update ${collectionName}`, docRef.path);
  } catch (error) {
    logError(`update ${collectionName}`, `users/${uid}/${collectionName}/${id}`, error);
    throw error;
  }
}

async function deleteItem(db: Firestore, uid: string, collectionName: string, id: string) {
  try {
    const docRef = doc(db, 'users', uid, collectionName, id);
    await deleteDoc(docRef);
    await mirrorToPublic(db, uid, collectionName, id, null, true);
    log(`delete ${collectionName}`, docRef.path);
  } catch (error) {
    logError(`delete ${collectionName}`, `users/${uid}/${collectionName}/${id}`, error);
    throw error;
  }
}

// --- Exported Professional Services ---

// Jobs
export const addJob = (db: Firestore, uid: string, data: Omit<JobEntry, 'id'>) => addItem(db, uid, 'jobs', data);
export const updateJob = (db: Firestore, uid: string, id: string, data: Partial<JobEntry>) => updateItem(db, uid, 'jobs', id, data);
export const deleteJob = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'jobs', id);
export function subscribeToJobs(db: Firestore, uid: string, onUpdate: (data: JobEntry[]) => void) {
  const q = query(collection(db, 'users', uid, 'jobs'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as JobEntry))));
}

// Education
export const addEducation = (db: Firestore, uid: string, data: Omit<EducationEntry, 'id'>) => addItem(db, uid, 'education', data);
export const updateEducation = (db: Firestore, uid: string, id: string, data: Partial<EducationEntry>) => updateItem(db, uid, 'education', id, data);
export const deleteEducation = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'education', id);
export function subscribeToEducation(db: Firestore, uid: string, onUpdate: (data: EducationEntry[]) => void) {
  const q = query(collection(db, 'users', uid, 'education'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as EducationEntry))));
}

// Experience
export const addExperience = (db: Firestore, uid: string, data: Omit<ExperienceEntry, 'id'>) => addItem(db, uid, 'experience', data);
export const updateExperience = (db: Firestore, uid: string, id: string, data: Partial<ExperienceEntry>) => updateItem(db, uid, 'experience', id, data);
export const deleteExperience = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'experience', id);
export function subscribeToExperience(db: Firestore, uid: string, onUpdate: (data: ExperienceEntry[]) => void) {
  const q = query(collection(db, 'users', uid, 'experience'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as ExperienceEntry))));
}

// Projects & Products
export const addProject = (db: Firestore, uid: string, data: Omit<ProjectEntry, 'id'>) => addItem(db, uid, 'projects', data);
export const updateProject = (db: Firestore, uid: string, id: string, data: Partial<ProjectEntry>) => updateItem(db, uid, 'projects', id, data);
export const deleteProject = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'projects', id);
export function subscribeToProjects(db: Firestore, uid: string, onUpdate: (data: ProjectEntry[]) => void) {
  const q = query(collection(db, 'users', uid, 'projects'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as ProjectEntry))));
}

// Portfolio Links
export const addPortfolioLink = (db: Firestore, uid: string, data: Omit<SocialLink, 'id'>) => addItem(db, uid, 'portfolioLinks', data);
export const deletePortfolioLink = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'portfolioLinks', id);
export function subscribeToPortfolioLinks(db: Firestore, uid: string, onUpdate: (data: SocialLink[]) => void) {
  const q = query(collection(db, 'users', uid, 'portfolioLinks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as SocialLink))));
}

// Resumes & Cover Letters
export const addResume = (db: Firestore, uid: string, data: Omit<ResumeDocument, 'id' | 'uploadDate'>) => 
  addItem(db, uid, 'resumes', { ...data, uploadDate: new Date().toLocaleDateString() });
export const deleteResume = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'resumes', id);
export function subscribeToResumes(db: Firestore, uid: string, onUpdate: (data: ResumeDocument[]) => void) {
  const q = query(collection(db, 'users', uid, 'resumes'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as ResumeDocument))));
}

export const addCoverLetter = (db: Firestore, uid: string, data: Omit<ResumeDocument, 'id' | 'uploadDate'>) => 
  addItem(db, uid, 'coverLetters', { ...data, uploadDate: new Date().toLocaleDateString() });
export const deleteCoverLetter = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'coverLetters', id);
export function subscribeToCoverLetters(db: Firestore, uid: string, onUpdate: (data: ResumeDocument[]) => void) {
  const q = query(collection(db, 'users', uid, 'coverLetters'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as ResumeDocument))));
}

// Bulk Mirroring metadata only
export async function publishToPublicVault(db: Firestore, uid: string, profileData: UserProfile) {
  try {
    const { education, experience, projects, portfolioLinks, resumes, coverLetters, jobs, ...basicInfo } = profileData;
    const ref = doc(db, 'shared-profiles', uid);
    await setDoc(ref, { profileData: basicInfo, publishedAt: serverTimestamp() }, { merge: true });
    log('publish metadata', `shared-profiles/${uid}`);
  } catch (error) {
    logError('publish profile', `shared-profiles/${uid}`, error);
    throw error;
  }
}
