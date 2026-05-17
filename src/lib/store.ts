
"use client";

import { create } from 'zustand';

/**
 * @fileOverview Zustand Global State Store
 * Acts as a local mirror for Firestore sub-collections.
 */

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
  cgpa?: string;
  percentage?: string;
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
  category: 'project' | 'product';
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
  address: string;
  website: string;
  gender: string;
  bio: string;
  avatarUrl?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  portfolioLinks: SocialLink[];
  resumes: ResumeDocument[];
  coverLetters: ResumeDocument[];
  jobs: JobEntry[];
  lastSyncedAt?: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  email: '',
  secondaryEmail: '',
  phone: '',
  address: '',
  website: '',
  gender: 'Prefer not to say',
  bio: '',
  avatarUrl: '',
  jobs: [],
  education: [],
  experience: [],
  projects: [],
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
  setEducation: (education: EducationEntry[]) => void;
  setExperience: (exp: ExperienceEntry[]) => void;
  setProjects: (proj: ProjectEntry[]) => void;
  setResumes: (resumes: ResumeDocument[]) => void;
  setCoverLetters: (coverLetters: ResumeDocument[]) => void;
  setPortfolioLinks: (links: SocialLink[]) => void;
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
  setEducation: (education) => set((state) => ({
    profile: { ...state.profile, education }
  })),
  setExperience: (experience) => set((state) => ({
    profile: { ...state.profile, experience }
  })),
  setProjects: (projects) => set((state) => ({
    profile: { ...state.profile, projects }
  })),
  setResumes: (resumes) => set((state) => ({
    profile: { ...state.profile, resumes }
  })),
  setCoverLetters: (coverLetters) => set((state) => ({
    profile: { ...state.profile, coverLetters }
  })),
  setPortfolioLinks: (portfolioLinks) => set((state) => ({
    profile: { ...state.profile, portfolioLinks }
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
