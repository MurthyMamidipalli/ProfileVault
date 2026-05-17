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
  Unsubscribe
} from 'firebase/firestore';
import { UserProfile, JobEntry, ExperienceEntry, ProjectEntry, ResumeDocument, EducationEntry, SocialLink } from '@/lib/store';

// --- Logging Helpers ---
const log = (action: string, path: string) => console.log(`[Firestore] ${action.toUpperCase()} success at ${path}`);
const logError = (action: string, path: string, error: any) => console.error(`[Firestore Error] ${action.toUpperCase()} failed at ${path}:`, error);

// --- Mirror Helpers ---
// This ensures data is mirrored to the public path for "Unlimited" storage support
async function mirrorToPublic(db: Firestore, uid: string, type: string, id: string, data: any, isDelete = false) {
  const path = `shared-profiles/${uid}/${type}/${id}`;
  try {
    const ref = doc(db, 'shared-profiles', uid, type, id);
    if (isDelete) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
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
    const updateData = { ...data, updatedAt: serverTimestamp() };
    await setDoc(ref, updateData, { merge: true });
    
    // Mirror basic info to the root of the shared profile (excluding large arrays)
    const { education, experience, projects, portfolioLinks, resumes, coverLetters, jobs, ...basicInfo } = updateData as any;
    await setDoc(doc(db, 'shared-profiles', uid), { profileData: basicInfo, publishedAt: serverTimestamp() }, { merge: true });
    
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

// --- Jobs (Sub-collection) ---
export async function addJob(db: Firestore, uid: string, data: Omit<JobEntry, 'id'>) {
  try {
    const colRef = collection(db, 'users', uid, 'jobs');
    const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    await mirrorToPublic(db, uid, 'jobs', docRef.id, data);
    log('add job', `users/${uid}/jobs/${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logError('add job', `users/${uid}/jobs`, error);
    throw error;
  }
}

export async function updateJob(db: Firestore, uid: string, jobId: string, data: Partial<JobEntry>) {
  try {
    const docRef = doc(db, 'users', uid, 'jobs', jobId);
    await updateDoc(docRef, data);
    await mirrorToPublic(db, uid, 'jobs', jobId, data);
    log('update job', `users/${uid}/jobs/${jobId}`);
  } catch (error) {
    logError('update job', `users/${uid}/jobs/${jobId}`, error);
    throw error;
  }
}

export async function deleteJob(db: Firestore, uid: string, jobId: string) {
  try {
    const docRef = doc(db, 'users', uid, 'jobs', jobId);
    await deleteDoc(docRef);
    await mirrorToPublic(db, uid, 'jobs', jobId, null, true);
    log('delete job', `users/${uid}/jobs/${jobId}`);
  } catch (error) {
    logError('delete job', `users/${uid}/jobs/${jobId}`, error);
    throw error;
  }
}

export function subscribeToJobs(db: Firestore, uid: string, onUpdate: (data: JobEntry[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'jobs');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as JobEntry)));
  });
}

// --- Education (Sub-collection) ---
export async function addEducation(db: Firestore, uid: string, data: Omit<EducationEntry, 'id'>) {
  try {
    const colRef = collection(db, 'users', uid, 'education');
    const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    await mirrorToPublic(db, uid, 'education', docRef.id, data);
    log('add education', `users/${uid}/education/${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logError('add education', `users/${uid}/education`, error);
    throw error;
  }
}

export async function updateEducation(db: Firestore, uid: string, eduId: string, data: Partial<EducationEntry>) {
  try {
    const docRef = doc(db, 'users', uid, 'education', eduId);
    await updateDoc(docRef, data);
    await mirrorToPublic(db, uid, 'education', eduId, data);
    log('update education', `users/${uid}/education/${eduId}`);
  } catch (error) {
    logError('update education', `users/${uid}/education/${eduId}`, error);
    throw error;
  }
}

export async function deleteEducation(db: Firestore, uid: string, eduId: string) {
  try {
    const docRef = doc(db, 'users', uid, 'education', eduId);
    await deleteDoc(docRef);
    await mirrorToPublic(db, uid, 'education', eduId, null, true);
    log('delete education', `users/${uid}/education/${eduId}`);
  } catch (error) {
    logError('delete education', `users/${uid}/education/${eduId}`, error);
    throw error;
  }
}

export function subscribeToEducation(db: Firestore, uid: string, onUpdate: (data: EducationEntry[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'education');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as EducationEntry)));
  });
}

// --- Experience (Sub-collection) ---
export async function addExperience(db: Firestore, uid: string, data: Omit<ExperienceEntry, 'id'>) {
  try {
    const colRef = collection(db, 'users', uid, 'experience');
    const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    await mirrorToPublic(db, uid, 'experience', docRef.id, data);
    log('add experience', `users/${uid}/experience/${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logError('add experience', `users/${uid}/experience`, error);
    throw error;
  }
}

export async function updateExperience(db: Firestore, uid: string, expId: string, data: Partial<ExperienceEntry>) {
  try {
    const docRef = doc(db, 'users', uid, 'experience', expId);
    await updateDoc(docRef, data);
    await mirrorToPublic(db, uid, 'experience', expId, data);
    log('update experience', `users/${uid}/experience/${expId}`);
  } catch (error) {
    logError('update experience', `users/${uid}/experience/${expId}`, error);
    throw error;
  }
}

export async function deleteExperience(db: Firestore, uid: string, expId: string) {
  try {
    const docRef = doc(db, 'users', uid, 'experience', expId);
    await deleteDoc(docRef);
    await mirrorToPublic(db, uid, 'experience', expId, null, true);
    log('delete experience', `users/${uid}/experience/${expId}`);
  } catch (error) {
    logError('delete experience', `users/${uid}/experience/${expId}`, error);
    throw error;
  }
}

export function subscribeToExperience(db: Firestore, uid: string, onUpdate: (data: ExperienceEntry[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'experience');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ExperienceEntry)));
  });
}

// --- Projects (Sub-collection) ---
export async function addProject(db: Firestore, uid: string, data: Omit<ProjectEntry, 'id'>) {
  try {
    const colRef = collection(db, 'users', uid, 'projects');
    const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    await mirrorToPublic(db, uid, 'projects', docRef.id, data);
    log('add project', `users/${uid}/projects/${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logError('add project', `users/${uid}/projects`, error);
    throw error;
  }
}

export async function updateProject(db: Firestore, uid: string, projId: string, data: Partial<ProjectEntry>) {
  try {
    const docRef = doc(db, 'users', uid, 'projects', projId);
    await updateDoc(docRef, data);
    await mirrorToPublic(db, uid, 'projects', projId, data);
    log('update project', `users/${uid}/projects/${projId}`);
  } catch (error) {
    logError('update project', `users/${uid}/projects/${projId}`, error);
    throw error;
  }
}

export async function deleteProject(db: Firestore, uid: string, projId: string) {
  try {
    const docRef = doc(db, 'users', uid, 'projects', projId);
    await deleteDoc(docRef);
    await mirrorToPublic(db, uid, 'projects', projId, null, true);
    log('delete project', `users/${uid}/projects/${projId}`);
  } catch (error) {
    logError('delete project', `users/${uid}/projects/${projId}`, error);
    throw error;
  }
}

export function subscribeToProjects(db: Firestore, uid: string, onUpdate: (data: ProjectEntry[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'projects');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProjectEntry)));
  });
}

// --- Portfolio Links (Sub-collection) ---
export async function addPortfolioLink(db: Firestore, uid: string, data: Omit<SocialLink, 'id'>) {
  try {
    const colRef = collection(db, 'users', uid, 'portfolioLinks');
    const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    await mirrorToPublic(db, uid, 'portfolioLinks', docRef.id, data);
    log('add portfolio link', `users/${uid}/portfolioLinks/${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logError('add portfolio link', `users/${uid}/portfolioLinks`, error);
    throw error;
  }
}

export async function deletePortfolioLink(db: Firestore, uid: string, linkId: string) {
  try {
    const docRef = doc(db, 'users', uid, 'portfolioLinks', linkId);
    await deleteDoc(docRef);
    await mirrorToPublic(db, uid, 'portfolioLinks', linkId, null, true);
    log('delete portfolio link', linkId);
  } catch (error) {
    logError('delete portfolio link', linkId, error);
    throw error;
  }
}

export function subscribeToPortfolioLinks(db: Firestore, uid: string, onUpdate: (data: SocialLink[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'portfolioLinks');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as SocialLink)));
  });
}

// --- Resumes & Cover Letters ---
export async function addResume(db: Firestore, uid: string, data: Omit<ResumeDocument, 'id' | 'uploadDate'>) {
  try {
    const colRef = collection(db, 'users', uid, 'resumes');
    const docRef = await addDoc(colRef, { 
      ...data, 
      uploadDate: new Date().toLocaleDateString(),
      createdAt: serverTimestamp() 
    });
    log('add resume', `users/${uid}/resumes/${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logError('add resume', `users/${uid}/resumes`, error);
    throw error;
  }
}

export async function deleteResume(db: Firestore, uid: string, id: string) {
  try {
    await deleteDoc(doc(db, 'users', uid, 'resumes', id));
    log('delete resume', id);
  } catch (error) {
    logError('delete resume', id, error);
    throw error;
  }
}

export function subscribeToResumes(db: Firestore, uid: string, onUpdate: (data: ResumeDocument[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'resumes');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ResumeDocument)));
  });
}

export async function addCoverLetter(db: Firestore, uid: string, data: Omit<ResumeDocument, 'id' | 'uploadDate'>) {
  try {
    const colRef = collection(db, 'users', uid, 'coverLetters');
    const docRef = await addDoc(colRef, { 
      ...data, 
      uploadDate: new Date().toLocaleDateString(),
      createdAt: serverTimestamp() 
    });
    log('add cover letter', `users/${uid}/coverLetters/${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logError('add cover letter', `users/${uid}/coverLetters`, error);
    throw error;
  }
}

export async function deleteCoverLetter(db: Firestore, uid: string, id: string) {
  try {
    await deleteDoc(doc(db, 'users', uid, 'coverLetters', id));
    log('delete cover letter', id);
  } catch (error) {
    logError('delete cover letter', id, error);
    throw error;
  }
}

export function subscribeToCoverLetters(db: Firestore, uid: string, onUpdate: (data: ResumeDocument[]) => void): Unsubscribe {
  const colRef = collection(db, 'users', uid, 'coverLetters');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ResumeDocument)));
  });
}

// --- Bulk Mirror (Initial Sync Only) ---
export async function publishToPublicVault(db: Firestore, uid: string, profileData: UserProfile) {
  try {
    // We only update the thinned basic profile info here to avoid the 1MB limit
    const { education, experience, projects, portfolioLinks, resumes, coverLetters, jobs, ...basicInfo } = profileData;
    const ref = doc(db, 'shared-profiles', uid);
    await setDoc(ref, { 
      profileData: basicInfo, 
      publishedAt: serverTimestamp() 
    }, { merge: true });
    log('publish metadata', `shared-profiles/${uid}`);
  } catch (error) {
    logError('publish profile', `shared-profiles/${uid}`, error);
    throw error;
  }
}
