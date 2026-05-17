
"use client";

import { create } from 'zustand';

export interface ProjectLink {
  id: string;
  name: string;
  url: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  projectLinks?: ProjectLink[];
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface ResumeDocument {
  id: string;
  name: string;
  type: 'file' | 'link';
  url: string;
  uploadDate: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  documentUrl?: string;
  documentName?: string;
  date?: string;
}

export interface JobEntry {
  id: string;
  company: string;
  role: string;
  joiningDate: string;
  endDate?: string;
  employmentType?: string;
  workSetting?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  secondaryPhone: string;
  address: string;
  website: string;
  gender: string;
  age: string;
  bio: string;
  avatarUrl?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  socialLinks: SocialLink[];
  portfolioLinks: SocialLink[];
  resumes: ResumeDocument[];
  coverLetters: ResumeDocument[];
  jobs: JobEntry[];
  sharedId?: string;
  lastSyncedAt?: string;
  name?: string; // Legacy support
}

export const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  email: '',
  secondaryEmail: '',
  phone: '',
  secondaryPhone: '',
  address: '',
  website: '',
  gender: 'Prefer not to say',
  age: '',
  bio: '',
  avatarUrl: '',
  jobs: [],
  education: [],
  experience: [],
  projects: [],
  socialLinks: [],
  portfolioLinks: [],
  resumes: [],
  coverLetters: []
};

interface ProfileStore {
  profile: UserProfile;
  isCloudLoaded: boolean;
  setIsCloudLoaded: (state: boolean) => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  replaceProfile: (profile: UserProfile) => void;
  addEducation: (entry: Omit<EducationEntry, 'id'>) => void;
  updateEducation: (id: string, entry: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;
  addExperience: (entry: Omit<ExperienceEntry, 'id' | 'projectLinks'> & { projectLinks?: ProjectLink[] }) => void;
  updateExperience: (id: string, entry: Partial<ExperienceEntry>) => void;
  removeExperience: (id: string) => void;
  addProject: (entry: Omit<ProjectEntry, 'id'>) => void;
  updateProject: (id: string, entry: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;
  addPortfolioLink: (link: Omit<SocialLink, 'id'>) => void;
  removePortfolioLink: (id: string) => void;
  addResume: (resume: Omit<ResumeDocument, 'id' | 'uploadDate'>) => void;
  removeResume: (id: string) => void;
  addCoverLetter: (doc: Omit<ResumeDocument, 'id' | 'uploadDate'>) => void;
  removeCoverLetter: (id: string) => void;
  addJob: (job: Omit<JobEntry, 'id'>) => void;
  updateJob: (id: string, job: Partial<JobEntry>) => void;
  removeJob: (id: string) => void;
  markSynced: (timestamp?: string) => void;
  reset: () => void;
}

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: DEFAULT_PROFILE,
  isCloudLoaded: false,
  setIsCloudLoaded: (state) => set({ isCloudLoaded: state }),
  setProfile: (updates) => set((state) => ({ 
    profile: { ...state.profile, ...updates } 
  })),
  replaceProfile: (fullProfile) => set((state) => {
    const incoming = fullProfile || DEFAULT_PROFILE;
    
    // Ensure all required arrays exist and handle legacy name field
    const merged: UserProfile = { 
      ...DEFAULT_PROFILE, 
      ...incoming,
      fullName: incoming.fullName || incoming.name || '',
      jobs: Array.isArray(incoming.jobs) ? incoming.jobs : [],
      education: Array.isArray(incoming.education) ? incoming.education : [],
      experience: Array.isArray(incoming.experience) ? incoming.experience : [],
      projects: Array.isArray(incoming.projects) ? incoming.projects : [],
      portfolioLinks: Array.isArray(incoming.portfolioLinks) ? incoming.portfolioLinks : [],
      resumes: Array.isArray(incoming.resumes) ? incoming.resumes : [],
      coverLetters: Array.isArray(incoming.coverLetters) ? incoming.coverLetters : []
    };
    
    return { 
      profile: merged,
      isCloudLoaded: true 
    };
  }),
  addEducation: (entry) => set((state) => ({
    profile: {
      ...state.profile,
      education: [...(state.profile.education || []), { ...entry, id: generateId() }]
    }
  })),
  updateEducation: (id, entry) => set((state) => ({
    profile: {
      ...state.profile,
      education: (state.profile.education || []).map((e) => e.id === id ? { ...e, ...entry } : e)
    }
  })),
  removeEducation: (id) => set((state) => ({
    profile: {
      ...state.profile,
      education: (state.profile.education || []).filter((e) => e.id !== id)
    }
  })),
  addExperience: (entry) => set((state) => ({
    profile: {
      ...state.profile,
      experience: [...(state.profile.experience || []), { ...entry, id: generateId() }]
    }
  })),
  updateExperience: (id, entry) => set((state) => ({
    profile: {
      ...state.profile,
      experience: (state.profile.experience || []).map((e) => e.id === id ? { ...e, ...entry } : e)
    }
  })),
  removeExperience: (id) => set((state) => ({
    profile: {
      ...state.profile,
      experience: (state.profile.experience || []).filter((e) => e.id !== id)
    }
  })),
  addProject: (entry) => set((state) => ({
    profile: {
      ...state.profile,
      projects: [...(state.profile.projects || []), { ...entry, id: generateId() }]
    }
  })),
  updateProject: (id, entry) => set((state) => ({
    profile: {
      ...state.profile,
      projects: (state.profile.projects || []).map((p) => p.id === id ? { ...p, ...entry } : p)
    }
  })),
  removeProject: (id) => set((state) => ({
    profile: {
      ...state.profile,
      projects: (state.profile.projects || []).filter((p) => p.id !== id)
    }
  })),
  addPortfolioLink: (link) => set((state) => ({
    profile: {
      ...state.profile,
      portfolioLinks: [...(state.profile.portfolioLinks || []), { ...link, id: generateId() }]
    }
  })),
  removePortfolioLink: (id) => set((state) => ({
    profile: {
      ...state.profile,
      portfolioLinks: (state.profile.portfolioLinks || []).filter((l) => l.id !== id)
    }
  })),
  addResume: (resume) => set((state) => ({
    profile: {
      ...state.profile,
      resumes: [...(state.profile.resumes || []), { 
        ...resume, 
        id: generateId(),
        uploadDate: new Date().toISOString().split('T')[0]
      }]
    }
  })),
  removeResume: (id) => set((state) => ({
    profile: {
      ...state.profile,
      resumes: (state.profile.resumes || []).filter((r) => r.id !== id)
    }
  })),
  addCoverLetter: (doc) => set((state) => ({
    profile: {
      ...state.profile,
      coverLetters: [...(state.profile.coverLetters || []), { 
        ...doc, 
        id: generateId(),
        uploadDate: new Date().toISOString().split('T')[0]
      }]
    }
  })),
  removeCoverLetter: (id) => set((state) => ({
    profile: {
      ...state.profile,
      coverLetters: (state.profile.coverLetters || []).filter((r) => r.id !== id)
    }
  })),
  addJob: (job) => set((state) => ({
    profile: {
      ...state.profile,
      jobs: [...(state.profile.jobs || []), { ...job, id: generateId() }]
    }
  })),
  updateJob: (id, job) => set((state) => ({
    profile: {
      ...state.profile,
      jobs: (state.profile.jobs || []).map((j) => j.id === id ? { ...j, ...job } : j)
    }
  })),
  removeJob: (id) => set((state) => ({
    profile: {
      ...state.profile,
      jobs: (state.profile.jobs || []).filter((j) => j.id !== id)
    }
  })),
  markSynced: (timestamp) => set((state) => ({
    profile: {
      ...state.profile,
      lastSyncedAt: timestamp || new Date().toISOString()
    }
  })),
  reset: () => set({ 
    profile: DEFAULT_PROFILE, 
    isCloudLoaded: false 
  })
}));
