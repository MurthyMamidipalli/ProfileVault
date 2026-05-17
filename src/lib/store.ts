
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
  name?: string; 
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
  setJobs: (jobs: JobEntry[]) => void;
  setExperience: (exp: ExperienceEntry[]) => void;
  setProjects: (proj: ProjectEntry[]) => void;
  markSynced: (timestamp?: string) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: DEFAULT_PROFILE,
  isCloudLoaded: false,
  setIsCloudLoaded: (state) => set({ isCloudLoaded: state }),
  setProfile: (updates) => set((state) => ({ 
    profile: { ...state.profile, ...updates } 
  })),
  setJobs: (jobs) => set((state) => ({
    profile: { ...state.profile, jobs }
  })),
  setExperience: (experience) => set((state) => ({
    profile: { ...state.profile, experience }
  })),
  setProjects: (projects) => set((state) => ({
    profile: { ...state.profile, projects }
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
