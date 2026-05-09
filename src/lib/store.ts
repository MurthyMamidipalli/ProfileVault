
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  date?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  gender: string;
  age: string;
  bio: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  socialLinks: SocialLink[];
  portfolioLinks: SocialLink[];
  resumes: ResumeDocument[];
  sharedId?: string;
}

interface ProfileStore {
  profile: UserProfile;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setProfile: (profile: Partial<UserProfile>) => void;
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
}

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Sterling',
  email: 'alex.sterling@example.com',
  phone: '+1 (555) 000-0000',
  address: 'San Francisco, CA',
  website: 'https://alexsterling.dev',
  gender: 'Male',
  age: '28',
  bio: 'Senior Frontend Engineer with a passion for building intuitive user experiences.',
  education: [
    {
      id: '1',
      institution: 'Stanford University',
      degree: 'Master of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2018-09-01',
      endDate: '2020-06-15',
      description: 'Focus on Human-Computer Interaction and AI.'
    }
  ],
  experience: [
    {
      id: '1',
      company: 'TechFlow Systems',
      title: 'Senior Frontend Engineer',
      location: 'Remote',
      startDate: '2020-07-01',
      endDate: 'Present',
      description: 'Leading the UI modernization project across the enterprise suite.',
      projectLinks: [
        { id: 'p1', name: 'UI Library Demo', url: 'https://github.com/techflow/ui-lib' }
      ]
    }
  ],
  projects: [],
  socialLinks: [
    { id: '1', platform: 'LinkedIn', url: 'https://linkedin.com/in/alexsterling' },
    { id: '2', platform: 'Twitter', url: 'https://twitter.com/alexsterling' }
  ],
  portfolioLinks: [
    { id: '1', platform: 'Personal Portfolio', url: 'https://alexsterling.dev' },
    { id: '2', platform: 'GitHub', url: 'https://github.com/asterling' }
  ],
  resumes: []
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setProfile: (updates) => set((state) => ({ 
        profile: { ...DEFAULT_PROFILE, ...state.profile, ...updates } 
      })),
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
      }))
    }),
    { 
      name: 'profile-vault-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
