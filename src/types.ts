export type Priority = 'low' | 'medium' | 'high';

export type TaskCategory = 'work' | 'study' | 'personal' | 'health' | 'finance' | 'other';

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  priority: Priority;
  category: TaskCategory;
  completed: boolean;
  notes?: string;
  reminder?: boolean;
  createdAt: number;
  isTopPriority?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: string[]; // e.g., ['Monday', 'Tuesday'] or 'daily'
  completedDates: string[]; // YYYY-MM-DD
  currentStreak: number;
  bestStreak: number;
  createdAt: number;
}

export interface TimeBlock {
  id: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  category: TaskCategory;
  notes?: string;
}

export interface DailyNote {
  date: string;
  content: string;
}

export interface DailyReview {
  date: string;
  achievements: string;
  improvements: string;
  tomorrowPriority: string;
}

export type ActiveTab = 'dashboard' | 'tasks' | 'schedule' | 'habits' | 'calendar' | 'statistics';
