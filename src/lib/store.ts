
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  bio: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  socialLinks: SocialLink[];
  portfolioLinks: SocialLink[];
}

interface ProfileStore {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  addEducation: (entry: Omit<EducationEntry, 'id'>) => void;
  updateEducation: (id: string, entry: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;
  addExperience: (entry: Omit<ExperienceEntry, 'id'>) => void;
  updateExperience: (id: string, entry: Partial<ExperienceEntry>) => void;
  removeExperience: (id: string) => void;
  addPortfolioLink: (link: Omit<SocialLink, 'id'>) => void;
  removePortfolioLink: (id: string) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: {
        name: 'Alex Sterling',
        email: 'alex.sterling@example.com',
        phone: '+1 (555) 000-0000',
        address: 'San Francisco, CA',
        website: 'https://alexsterling.dev',
        bio: '',
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
            description: 'Leading the UI modernization project across the enterprise suite.'
          }
        ],
        socialLinks: [
          { id: '1', platform: 'LinkedIn', url: 'https://linkedin.com/in/alexsterling' },
          { id: '2', platform: 'Twitter', url: 'https://twitter.com/alexsterling' }
        ],
        portfolioLinks: [
          { id: '1', platform: 'Personal Portfolio', url: 'https://alexsterling.dev' },
          { id: '2', platform: 'GitHub', url: 'https://github.com/asterling' }
        ]
      },
      setProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
      addEducation: (entry) => set((state) => ({
        profile: {
          ...state.profile,
          education: [...state.profile.education, { ...entry, id: crypto.randomUUID() }]
        }
      })),
      updateEducation: (id, entry) => set((state) => ({
        profile: {
          ...state.profile,
          education: state.profile.education.map((e) => e.id === id ? { ...e, ...entry } : e)
        }
      })),
      removeEducation: (id) => set((state) => ({
        profile: {
          ...state.profile,
          education: state.profile.education.filter((e) => e.id !== id)
        }
      })),
      addExperience: (entry) => set((state) => ({
        profile: {
          ...state.profile,
          experience: [...state.profile.experience, { ...entry, id: crypto.randomUUID() }]
        }
      })),
      updateExperience: (id, entry) => set((state) => ({
        profile: {
          ...state.profile,
          experience: state.profile.experience.map((e) => e.id === id ? { ...e, ...entry } : e)
        }
      })),
      removeExperience: (id) => set((state) => ({
        profile: {
          ...state.profile,
          experience: state.profile.experience.filter((e) => e.id !== id)
        }
      })),
      addPortfolioLink: (link) => set((state) => ({
        profile: {
          ...state.profile,
          portfolioLinks: [...state.profile.portfolioLinks, { ...link, id: crypto.randomUUID() }]
        }
      })),
      removePortfolioLink: (id) => set((state) => ({
        profile: {
          ...state.profile,
          portfolioLinks: state.profile.portfolioLinks.filter((l) => l.id !== id)
        }
      }))
    }),
    { name: 'profile-vault-storage' }
  )
);
