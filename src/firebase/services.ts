
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
  getDocs,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { UserProfile, JobEntry, ExperienceEntry, ProjectEntry, ResumeDocument, EducationEntry, SocialLink } from '@/lib/store';

/**
 * @fileOverview Atomic Firestore Service Layer
 * Hardened to prevent duplication and legacy array leakage.
 */

// --- Mirror Helpers ---
async function mirrorToPublic(db: Firestore, uid: string, type: string, id: string, data: any, isDelete = false) {
  try {
    const ref = doc(db, 'shared-profiles', uid, type, id);
    if (isDelete) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { 
        ...data, 
        updatedAt: serverTimestamp(),
        createdAt: data.createdAt || serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.error(`[Mirror Error] Failed to mirror ${type}:`, err);
  }
}

/**
 * Reconciles the public shared vault to perfectly match the private vault.
 * Explicitly removes legacy root-level arrays that cause duplication.
 */
export async function forceMirrorAll(db: Firestore, uid: string, profile: UserProfile) {
  console.log("[Sync] Deep Reconciliation Start...");
  
  const subCollections = [
    'jobs', 'education', 'experience', 'projects', 'portfolioLinks', 'resumes', 'coverLetters'
  ];

  try {
    // 1. MIRROR BASIC METADATA & PURGE LEGACY ARRAYS
    // This step is critical: we use deleteField() to wipe out any old array data at the root.
    const profileRef = doc(db, 'shared-profiles', uid);
    const { education, experience, projects, portfolioLinks, resumes, coverLetters, jobs, ...basicInfo } = profile;
    
    await setDoc(profileRef, { 
      profileData: basicInfo,
      publishedAt: serverTimestamp(),
      // Hard purge of legacy root fields
      education: deleteField(),
      experience: deleteField(),
      projects: deleteField(),
      portfolioLinks: deleteField(),
      resumes: deleteField(),
      coverLetters: deleteField(),
      jobs: deleteField(),
      // Also check for common capitalized versions just in case
      Projects: deleteField(),
      Experience: deleteField(),
      Education: deleteField()
    }, { merge: true });

    // 2. RECONCILE SUB-COLLECTIONS
    for (const colName of subCollections) {
      const privateColRef = collection(db, 'users', uid, colName);
      const privateSnap = await getDocs(privateColRef);
      const privateIds = new Set(privateSnap.docs.map(d => d.id));

      const publicColRef = collection(db, 'shared-profiles', uid, colName);
      const publicSnap = await getDocs(publicColRef);

      const batch = writeBatch(db);
      let removed = 0;
      
      // Remove any items in public mirror that don't exist in private
      publicSnap.docs.forEach(doc => {
        if (!privateIds.has(doc.id)) {
          batch.delete(doc.ref);
          removed++;
        }
      });
      
      if (removed > 0) await batch.commit();

      // Refresh all valid records
      for (const d of privateSnap.docs) {
        await mirrorToPublic(db, uid, colName, d.id, d.data());
      }
    }
    console.log("[Sync] Reconciliation Complete. Duplicates purged.");
  } catch (error) {
    console.error("[Sync] Reconciliation Failed:", error);
    throw error;
  }
}

// --- Profile Info ---
export async function saveProfileInfo(db: Firestore, uid: string, data: Partial<UserProfile>) {
  try {
    const ref = doc(db, 'users', uid, 'profile', 'basic');
    const { education, experience, projects, portfolioLinks, resumes, coverLetters, jobs, ...cleanData } = data as any;
    const updateData = { ...cleanData, updatedAt: serverTimestamp() };
    
    await setDoc(ref, updateData, { merge: true });
    
    // Mirror basic metadata to root shared profile
    await setDoc(doc(db, 'shared-profiles', uid), { 
      profileData: updateData, 
      publishedAt: serverTimestamp() 
    }, { merge: true });
  } catch (error) {
    throw error;
  }
}

export function subscribeToProfileInfo(db: Firestore, uid: string, onUpdate: (data: any) => void): Unsubscribe {
  const ref = doc(db, 'users', uid, 'profile', 'basic');
  return onSnapshot(ref, (snap) => onUpdate(snap.exists() ? snap.data() : null));
}

// --- CRUD Factory ---
async function addItem(db: Firestore, uid: string, collectionName: string, data: any) {
  const colRef = collection(db, 'users', uid, collectionName);
  const timestamp = serverTimestamp();
  const docData = { ...data, createdAt: timestamp, updatedAt: timestamp };
  const docRef = await addDoc(colRef, docData);
  await mirrorToPublic(db, uid, collectionName, docRef.id, docData);
  return docRef.id;
}

async function updateItem(db: Firestore, uid: string, collectionName: string, id: string, data: any) {
  const docRef = doc(db, 'users', uid, collectionName, id);
  const timestamp = serverTimestamp();
  const updateData = { ...data, updatedAt: timestamp };
  await updateDoc(docRef, updateData);
  await mirrorToPublic(db, uid, collectionName, id, updateData);
}

async function deleteItem(db: Firestore, uid: string, collectionName: string, id: string) {
  const docRef = doc(db, 'users', uid, collectionName, id);
  await deleteDoc(docRef);
  await mirrorToPublic(db, uid, collectionName, id, null, true);
}

// --- Professional Services ---
export const addJob = (db: Firestore, uid: string, data: Omit<JobEntry, 'id'>) => addItem(db, uid, 'jobs', data);
export const updateJob = (db: Firestore, uid: string, id: string, data: Partial<JobEntry>) => updateItem(db, uid, 'jobs', id, data);
export const deleteJob = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'jobs', id);
export function subscribeToJobs(db: Firestore, uid: string, onUpdate: (data: JobEntry[]) => void) {
  const q = query(collection(db, 'users', uid, 'jobs'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as JobEntry))));
}

export const addEducation = (db: Firestore, uid: string, data: Omit<EducationEntry, 'id'>) => addItem(db, uid, 'education', data);
export const updateEducation = (db: Firestore, uid: string, id: string, data: Partial<EducationEntry>) => updateItem(db, uid, 'education', id, data);
export const deleteEducation = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'education', id);
export function subscribeToEducation(db: Firestore, uid: string, onUpdate: (data: EducationEntry[]) => void) {
  const q = query(collection(db, 'users', uid, 'education'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as EducationEntry))));
}

export const addExperience = (db: Firestore, uid: string, data: Omit<ExperienceEntry, 'id'>) => addItem(db, uid, 'experience', data);
export const updateExperience = (db: Firestore, uid: string, id: string, data: Partial<ExperienceEntry>) => updateItem(db, uid, 'experience', id, data);
export const deleteExperience = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'experience', id);
export function subscribeToExperience(db: Firestore, uid: string, onUpdate: (data: ExperienceEntry[]) => void) {
  const q = query(collection(db, 'users', uid, 'experience'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as ExperienceEntry))));
}

export const addProject = (db: Firestore, uid: string, data: Omit<ProjectEntry, 'id'>) => addItem(db, uid, 'projects', data);
export const updateProject = (db: Firestore, uid: string, id: string, data: Partial<ProjectEntry>) => updateItem(db, uid, 'projects', id, data);
export const deleteProject = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'projects', id);
export function subscribeToProjects(db: Firestore, uid: string, onUpdate: (data: ProjectEntry[]) => void) {
  const q = query(collection(db, 'users', uid, 'projects'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as ProjectEntry))));
}

export const addPortfolioLink = (db: Firestore, uid: string, data: Omit<SocialLink, 'id'>) => addItem(db, uid, 'portfolioLinks', data);
export const deletePortfolioLink = (db: Firestore, uid: string, id: string) => deleteItem(db, uid, 'portfolioLinks', id);
export function subscribeToPortfolioLinks(db: Firestore, uid: string, onUpdate: (data: SocialLink[]) => void) {
  const q = query(collection(db, 'users', uid, 'portfolioLinks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id } as SocialLink))));
}

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

export async function publishToPublicVault(db: Firestore, uid: string, profileData: UserProfile) {
  const { education, experience, projects, portfolioLinks, resumes, coverLetters, jobs, ...basicInfo } = profileData;
  const ref = doc(db, 'shared-profiles', uid);
  await setDoc(ref, { profileData: basicInfo, publishedAt: serverTimestamp() }, { merge: true });
}
