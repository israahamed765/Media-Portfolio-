export interface ProfileData {
  name: {
    ar: string;
    en: string;
  };
  title: {
    ar: string;
    en: string;
  };
  bio: {
    ar: string;
    en: string;
  };
  imageUrl: string;
  cvUrl?: string;
  cvChunksCount?: number;
  metrics: Array<{
    id: string;
    label: { ar: string; en: string };
    value: string;
    link?: string;
  }>;
}

export type MediaCategory = 'video' | 'audio' | 'written';

export interface ProjectData {
  id: string;
  category: MediaCategory;
  title: {
    ar: string;
    en: string;
  };
  publisher: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  link: string;
  date: string;
  imageUrl?: string;
}

export interface SkillData {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  level: number; // 0 - 100
  iconName: string; // e.g. "Tv", "Mic", "FileText", "Volume2", "Award", "Users"
  category: {
    ar: string;
    en: string;
  };
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  handle: string;
  purpose: {
    ar: string;
    en: string;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
}
